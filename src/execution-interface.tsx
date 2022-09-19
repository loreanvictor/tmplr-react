import React from 'react'
import { useAsync } from 'react-use'
import { Execution, ChangeLog, Stack } from '@tmplr/core'

import { useExecutionStack } from './use-execution-stack'


export interface ComponentSet {
  Logger: React.ComponentType<{changeLog: ChangeLog}>
  Error: React.ComponentType<{message: string, trace?: Stack, error?: Error}>
  Waiting: React.ComponentType<{execution?: Execution<unknown>}>
  route: (execution?: Execution<unknown>) => React.ComponentType<{}> | undefined
}


export interface ExecutionInterfaceProps {
  execution: Execution<unknown>,
  components: ComponentSet,
  changeLog: ChangeLog,
}


export function ExecutionInterface({ execution, components, changeLog }: ExecutionInterfaceProps) {
  const stack = useExecutionStack(execution)
  const { loading, error } = useAsync(() => execution.execute())

  if (error) {
    return <components.Error message={error.message} trace={stack} error={error} />
  }

  const Component = components.route(stack?.peek())
  if (Component) {
    return <Component />
  }

  if (loading) {
    return <components.Waiting execution={stack?.peek()} />
  }

  return <components.Logger changeLog={changeLog} />
}
