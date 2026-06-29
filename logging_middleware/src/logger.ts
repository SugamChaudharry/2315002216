import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

const TEST_SERVER = process.env.TEST_SERVER || 'http://4.224.186.213/evaluation-service'
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''

type Stack = 'backend' | 'frontend'
type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
type BackendPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service'
type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state'
type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils' | 'style'
type Package = BackendPackage | FrontendPackage | SharedPackage

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  try {
    await fetch(`${TEST_SERVER}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({ stack, level, package: pkg, message })
    })
  } catch (err) {
    // silent fail — logging should never crash the app
    console.error('[Logger Error]', err)
  }
}