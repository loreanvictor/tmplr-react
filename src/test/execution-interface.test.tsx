import React from 'react'
import '@testing-library/jest-dom'
import { render, screen, act } from '@testing-library/react'
import { Execution, Deferred, ChangeLog, Flow } from '@tmplr/core'

import { ExecutionInterface } from '../execution-interface'


class ExA extends Execution<void> {
  constructor(
    readonly pre: Deferred<void>,
    readonly child: Execution<void>,
    readonly post: Deferred<void>,
    flow: Flow,
  ) { super(flow) }
  async run() {
    await this.pre.promise
    await this.delegate(this.child)
    await this.post.promise
  }
}

class ExB extends Execution<void> {
  constructor(readonly gate: Deferred<void>, flow: Flow) { super(flow) }
  async run() { await this.gate.promise }
}

class ExE extends Execution<void> {
  async run() { throw new Error('Wassup?') }
}

describe(ExecutionInterface, () => {
  test('renders the correct components.', async () => {
    const g1 = new Deferred<void>()
    const g2 = new Deferred<void>()
    const g3 = new Deferred<void>()

    const flow = new Flow()
    const child = new ExB(g2, flow)
    const execution = new ExA(g1, child, g3, flow)

    render(<ExecutionInterface
      execution={execution}
      changeLog={new ChangeLog()}
      components={{
        Logger: () => <span role='log'>Logger</span>,
        Error: () => <span role='err'>Error</span>,
        Waiting: props => <span role='wait'>Waiting: {props.execution?.constructor.name}</span>,
        route: (ex?: Execution<unknown>) =>
          ex?.constructor === ExB ? () => <span role='route'>Route</span> : undefined
      }}
    />)

    expect(await screen.findByRole('wait')).toHaveTextContent('Waiting: ExA')
    act(() => g1.resolve())
    expect(await screen.findByRole('route')).toHaveTextContent('Route')
    act(() => g2.resolve())
    expect(await screen.findByRole('wait')).toHaveTextContent('Waiting: ExA')
    act(() => g3.resolve())
    expect(await screen.findByRole('log')).toHaveTextContent('Logger')
  })

  test('renders the error component.', async () => {
    const g1 = new Deferred<void>()
    const g2 = new Deferred<void>()

    const flow = new Flow()
    const child = new ExE(flow)
    const execution = new ExA(g1, child, g2, flow)

    render(<ExecutionInterface
      execution={execution}
      changeLog={new ChangeLog()}
      components={{
        Logger: () => <span />,
        Error: (props) => <span role='err'>Error: {props.message} | {props.trace?.peek()?.constructor.name}</span>,
        Waiting: () => <span role='wait'>Wait</span>,
        route: () => undefined,
      }}
    />)

    expect(await screen.findByRole('wait')).toHaveTextContent('Wait')
    act(() => g1.resolve())
    expect(await screen.findByRole('err')).toHaveTextContent('Error: Wassup? | ExE')
  })
})
