import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RiskTolerance, StockRecommendation } from '@market-mind/common';
import { UserProfileEntity } from '@market-mind/database';
import * as nodemailer from 'nodemailer';
import { appConfig } from '../config/appConfig';
import { NotificationService } from './notification.service';
import { RecommendationNotificationPayload } from './notification.types';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

const makePayload = (
  overrides: Partial<RecommendationNotificationPayload> = {},
): RecommendationNotificationPayload => ({
  stockSymbol: 'AAPL',
  riskTolerance: RiskTolerance.MEDIUM,
  previousStatus: StockRecommendation.INVEST,
  newStatus: StockRecommendation.HOLD,
  rationale: 'Momentum weakened after earnings.',
  ...overrides,
});

describe('NotificationService', () => {
  let service: NotificationService;
  let userProfileRepo: { createQueryBuilder: jest.Mock };
  const originalEmailConfig = { ...appConfig.email };
  const emailConfig = appConfig.email as {
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpAllowSelfSigned: boolean;
    smtpUser: string;
    smtpPass: string;
    from: string;
  };
  const sendMail = jest.fn().mockResolvedValue(undefined);
  const createTransport = jest.mocked(nodemailer.createTransport);

  beforeEach(async () => {
    jest.clearAllMocks();
    emailConfig.smtpHost = 'smtp.gmail.com';
    emailConfig.smtpPort = 465;
    emailConfig.smtpSecure = true;
    emailConfig.smtpAllowSelfSigned = false;
    emailConfig.smtpUser = 'marketminddev@gmail.com';
    emailConfig.smtpPass = 'app-password';
    emailConfig.from = 'marketminddev@gmail.com';
    createTransport.mockReturnValue({
      sendMail,
    } as never);

    const getRawMany = jest.fn().mockResolvedValue([
      { email: 'alice@example.com', fullName: 'Alice' },
      { email: 'bob@example.com', fullName: 'Bob' },
    ]);
    const distinct = jest.fn().mockReturnValue({ getRawMany });
    const andWhere: jest.Mock = jest.fn();
    andWhere.mockReturnValue({ andWhere, distinct });
    const where = jest.fn().mockReturnValue({ andWhere });
    const select = jest.fn().mockReturnValue({ where });
    const innerJoin = jest.fn().mockReturnValue({ select });

    userProfileRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({ innerJoin }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(UserProfileEntity), useValue: userProfileRepo },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterAll(() => {
    emailConfig.smtpHost = originalEmailConfig.smtpHost;
    emailConfig.smtpPort = originalEmailConfig.smtpPort;
    emailConfig.smtpSecure = originalEmailConfig.smtpSecure;
    emailConfig.smtpAllowSelfSigned = originalEmailConfig.smtpAllowSelfSigned;
    emailConfig.smtpUser = originalEmailConfig.smtpUser;
    emailConfig.smtpPass = originalEmailConfig.smtpPass;
    emailConfig.from = originalEmailConfig.from;
  });

  it('emails only users tracking the stock with the matching risk tolerance', async () => {
    await service.notifyRecommendationChange(makePayload());

    expect(userProfileRepo.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'marketminddev@gmail.com',
        pass: 'app-password',
      },
      tls: undefined,
    });
    expect(sendMail).toHaveBeenCalledTimes(1);

    const body = sendMail.mock.calls[0][0] as {
      to: string[];
      subject: string;
      text: string;
    };

    expect(body.to).toEqual(['alice@example.com', 'bob@example.com']);
    expect(body.subject).toBe('AAPL: our latest suggestion');
    expect(body.text).toContain(
      'We took another look at AAPL and wanted to share our latest view.',
    );
    expect(body.text).toContain(
      'Our suggestion for now is to hold AAPL. The current outlook suggests staying put because Momentum weakened after earnings.',
    );
    expect(body.text).toContain('View this recommendation: http://localhost:4200/stock/AAPL');
    expect(body.text).toContain('http://localhost:4200/dashboard');
    expect(body.text).not.toContain('Risk tolerance:');
    expect(body.text).not.toContain('Previous status:');
  });

  it('does not call SMTP when there are no recipients', async () => {
    const getRawMany = jest.fn().mockResolvedValue([]);
    const distinct = jest.fn().mockReturnValue({ getRawMany });
    const andWhere: jest.Mock = jest.fn();
    andWhere.mockReturnValue({ andWhere, distinct });
    const where = jest.fn().mockReturnValue({ andWhere });
    const select = jest.fn().mockReturnValue({ where });
    const innerJoin = jest.fn().mockReturnValue({ select });
    userProfileRepo.createQueryBuilder.mockReturnValue({ innerJoin });

    await service.notifyRecommendationChange(makePayload());

    expect(createTransport).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('falls back to a generic greeting when a recipient name is missing', async () => {
    const getRawMany = jest.fn().mockResolvedValue([
      { email: 'alice@example.com', fullName: undefined },
      { email: 'bob@example.com', fullName: '   ' },
    ]);
    const distinct = jest.fn().mockReturnValue({ getRawMany });
    const andWhere: jest.Mock = jest.fn();
    andWhere.mockReturnValue({ andWhere, distinct });
    const where = jest.fn().mockReturnValue({ andWhere });
    const select = jest.fn().mockReturnValue({ where });
    const innerJoin = jest.fn().mockReturnValue({ select });
    userProfileRepo.createQueryBuilder.mockReturnValue({ innerJoin });

    await service.notifyRecommendationChange(makePayload());

    const body = sendMail.mock.calls[0][0] as { text: string };

    expect(body.text.startsWith('Hi,')).toBe(true);
  });

  it('uses invest-specific copy for invest recommendations', async () => {
    await service.notifyRecommendationChange(makePayload({ newStatus: StockRecommendation.INVEST }));

    const body = sendMail.mock.calls[0][0] as { text: string };

    expect(body.text).toContain(
      'Right now, AAPL looks like a strong opportunity. Based on our latest analysis, this may be a good time to invest because Momentum weakened after earnings.',
    );
  });

  it('skips sending when email configuration is missing', async () => {
    emailConfig.smtpPass = '';

    await service.notifyRecommendationChange(makePayload({ previousStatus: null }));

    expect(createTransport).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('surfaces SMTP send failures to the caller', async () => {
    sendMail.mockRejectedValueOnce(new Error('SMTP unavailable'));

    await expect(service.notifyRecommendationChange(makePayload())).rejects.toThrow(
      'SMTP unavailable',
    );
  });

  it('allows self-signed certificates when explicitly enabled', async () => {
    emailConfig.smtpAllowSelfSigned = true;

    await service.notifyRecommendationChange(makePayload());

    expect(createTransport).toHaveBeenCalledWith({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'marketminddev@gmail.com',
        pass: 'app-password',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  });
});
