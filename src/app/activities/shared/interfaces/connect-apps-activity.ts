// import { AuthType } from "../services/auth-activity.service";

import { AuthType } from "src/app/shared/services/auth.service";

export interface ConnectAppInterface {
  title: string;
  subtitle: string;
  description: string;
  key: AuthType;
}
