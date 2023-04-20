import { SetMetadata } from '@nestjs/common';

export const HasAdmin = () => SetMetadata('isAdmin', true);
