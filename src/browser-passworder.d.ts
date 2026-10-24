declare module 'browser-passworder' {
  export function encrypt(password: string, data: unknown): Promise<string>
  export function decrypt<T = unknown>(password: string, data: string): Promise<T>
}
