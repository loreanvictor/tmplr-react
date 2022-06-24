import React from 'react'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { Execution, Deferred, Stack } from '@tmplr/core'

import { useExecutionStack } from '../use-execution-stack'


const wait = ms => new Promise<void>(resolve => setTimeout(() => resolve(), ms))

class ExA extends Execution<void> {
  constructor(
    readonly pre: Deferred<void>,
    readonly child: Execution<void>,
    readonly post: Deferred<void>,
  ) { super() }
  async run() {
    await this.pre.promise
    await this.delegate(this.child)
    await this.post.promise
  }
}

class ExB extends Execution<void> {
  constructor(readonly gate: Deferred<void>) { super() }
  async run() { await this.gate.promise }
}


describe(useExecutionStack, () => {
  test('properly tracks the execution stack.', async () => {
    const g1 = new Deferred<void>()
    const g2 = new Deferred<void>()
    const g3 = new Deferred<void>()

    const child = new ExB(g2)
    const execution = new ExA(g1, child, g3)
    const res: (Stack | undefined)[] = []
    const Comp = () => {
      const stack = useExecutionStack(execution)
      res.push(stack)

      return <span>{stack?.stack.length}</span>
    }

    render(<Comp/>)
    await Promise.all([
      execution.execute(),
      (async () => {
        await wait(10)
        g1.resolve()
        await wait(10)
        g2.resolve()
        await wait(10)
        g3.resolve()
        await wait(10)
      })()
    ])

    expect(res[0]).toBe(undefined)
    expect(res[1]!.peek()).toBe(execution)
    expect(res[1]!.stack.length).toBe(1)
    expect(res[2]!.parent()).toBe(execution)
    expect(res[2]!.peek()).toBe(child)
    expect(res[2]!.stack.length).toBe(2)
    expect(res[3]!.peek()).toBe(execution)
    expect(res[3]!.stack.length).toBe(1)
    expect(res[4]).toBe(undefined)
  })
})
