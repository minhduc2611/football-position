export function uid(prefix = '') {
  return `${prefix}${crypto.randomUUID().slice(0, 8)}`
}
