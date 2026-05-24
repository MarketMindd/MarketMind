import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecommendationStatus, RiskTolerance, StockRecommendation } from '@market-mind/common';
import { PortfolioEntity, UserProfileEntity } from '@market-mind/database';
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';
import { appConfig } from '../config/appConfig';
import { RecommendationNotificationPayload } from './notification.types';

interface NotificationRecipient {
  email: string;
  fullName?: string | null;
}

interface NotificationEmailPayload {
  from: string;
  to: string[];
  subject: string;
  text: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepo: Repository<UserProfileEntity>,
  ) {}

  async notifyRecommendationChange(
    payload: RecommendationNotificationPayload,
  ): Promise<void> {
    const recipients = await this.loadRecipients(payload.stockSymbol, payload.riskTolerance);

    if (recipients.length === 0) {
      this.logger.debug(
        `No email recipients for ${payload.stockSymbol}/${payload.riskTolerance} notification`,
      );
      return;
    }

    if (!this.hasSmtpConfig()) {
      this.logger.warn(
        `Email skipped for ${payload.stockSymbol}/${payload.riskTolerance}: missing SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, or EMAIL_FROM`,
      );
      return;
    }

    const email = this.buildEmail(payload, recipients);
    await this.sendEmail(email);
  }

  private async loadRecipients(
    stockSymbol: string,
    riskTolerance: RiskTolerance,
  ): Promise<NotificationRecipient[]> {
    return this.userProfileRepo
      .createQueryBuilder('user')
      .innerJoin(PortfolioEntity, 'portfolio', 'portfolio.userId = user.id')
      .select(['user.email AS email', 'user.fullName AS fullName'])
      .where('portfolio.stockSymbol = :stockSymbol', { stockSymbol })
      .andWhere('user.riskTolerance = :riskTolerance', { riskTolerance })
      .distinct(true)
      .getRawMany<NotificationRecipient>();
  }

  private buildEmail(
    payload: RecommendationNotificationPayload,
    recipients: NotificationRecipient[],
  ): NotificationEmailPayload {
    const subject = `${payload.stockSymbol}: our latest suggestion`;
    const dashboardUrl = `${appConfig.clientUrl}/dashboard`;
    const recommendationUrl = `${appConfig.clientUrl}/stock/${encodeURIComponent(payload.stockSymbol)}`;
    const greetingNames = recipients
      .map((recipient) => recipient.fullName?.trim() ?? '')
      .filter((fullName) => fullName.length > 0);
    const greeting = greetingNames.length === 1 ? `Hi ${greetingNames[0]},` : 'Hi,';
    const suggestionLine = this.buildSuggestionLine(
      payload.stockSymbol,
      payload.newStatus,
      payload.rationale,
    );

    return {
      from: appConfig.email.from,
      to: recipients.map((recipient) => recipient.email),
      subject,
      text: [
        greeting,
        '',
        `We took another look at ${payload.stockSymbol} and wanted to share our latest view.`,
        suggestionLine,
        '',
        `View this recommendation: ${recommendationUrl}`,
        '',
        'You can also open your dashboard anytime to see more details.',
        dashboardUrl,
        '',
        'Best,',
        'The MarketMind team',
      ].join('\n'),
    };
  }

  private buildSuggestionLine(
    stockSymbol: string,
    status: RecommendationStatus,
    rationale: string,
  ): string {
    switch (status) {
      case StockRecommendation.INVEST:
        return `Right now, ${stockSymbol} looks like a strong opportunity. Based on our latest analysis, this may be a good time to invest because ${rationale}`;
      case StockRecommendation.HOLD:
        return `Our suggestion for now is to hold ${stockSymbol}. The current outlook suggests staying put because ${rationale}`;
      case StockRecommendation.EXIT:
        return `At this stage, it may be worth stepping away from ${stockSymbol}. We're seeing signs that support an exit because ${rationale}`;
      default:
        return `Our latest suggestion for ${stockSymbol} is ${status} because ${rationale}`;
    }
  }

  private hasSmtpConfig(): boolean {
    return (
      appConfig.email.smtpHost.length > 0 &&
      Number.isFinite(appConfig.email.smtpPort) &&
      appConfig.email.smtpPort > 0 &&
      appConfig.email.smtpUser.length > 0 &&
      appConfig.email.smtpPass.length > 0 &&
      appConfig.email.from.length > 0
    );
  }

  private async sendEmail(payload: NotificationEmailPayload): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: appConfig.email.smtpHost,
      port: appConfig.email.smtpPort,
      secure: appConfig.email.smtpSecure,
      auth: {
        user: appConfig.email.smtpUser,
        pass: appConfig.email.smtpPass,
      },
      tls: appConfig.email.smtpAllowSelfSigned
        ? { rejectUnauthorized: false }
        : undefined,
    });

    await transporter.sendMail(payload);
  }
}
