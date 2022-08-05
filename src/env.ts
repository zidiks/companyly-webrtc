import { environment as devEnv } from "./environments/environment";
import { environment as prodEnv } from "./environments/environment.prod";

const dev: boolean = process.env.npm_lifecycle_script === 'nodemon';

export const environment = dev ? devEnv : prodEnv;