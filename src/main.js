/** @flow */

function delayedHello(name: string, delay: number = 2000): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(`Hello, ${name}`), delay)
  })
}

export default async function greeter(name: string): Promise<string> {
  return delayedHello(name)
}
