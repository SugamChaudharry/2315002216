declare module "dotenv" {
  interface DotenvConfigOptions {
    path?: string;
    encoding?: string;
    debug?: boolean;
  }

  interface DotenvParseOutput {
    [name: string]: string;
  }

  export function config(options?: DotenvConfigOptions): {
    error?: Error;
    parsed?: DotenvParseOutput;
  };

  const dotenv: {
    config(options?: DotenvConfigOptions): {
      error?: Error;
      parsed?: DotenvParseOutput;
    };
  };

  export default dotenv;
}
