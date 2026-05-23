import { Body, Controller, Patch, Request } from '@nestjs/common';
import { updateProfileSchema } from '@market-mind/common';
import type { UpdateProfilePayload } from '@market-mind/common';
import { ZodValidationPipe } from '../pipes/zodValidatorPipe';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch()
  async updateProfile(
    @Request() req: any,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfilePayload,
  ): Promise<{ success: boolean }> {
    await this.profileService.updateProfile(req.user.id, body);
    return { success: true };
  }
}
