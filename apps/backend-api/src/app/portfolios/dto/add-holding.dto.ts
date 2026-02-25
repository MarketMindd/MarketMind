import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class AddHoldingDto {
  @IsString()
  @MaxLength(12)
  @Matches(/^[A-Za-z.\-]+$/)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsNotEmpty()
  symbol!: string;

  @IsString()
  @MaxLength(255)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
  companyName!: string;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0.000001)
  shares!: number;

  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0.000001)
  avgPrice!: number;
}
