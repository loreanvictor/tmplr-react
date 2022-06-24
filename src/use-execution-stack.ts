import { Execution, Stack } from '@tmplr/core'
import { useEffect, useState } from 'react'
import { pipe, tap, finalize, observe } from 'streamlets'


export function useExecutionStack(execution: Execution<unknown>): Stack | undefined {
  const [ stack, update ] = useState<Stack | undefined>(undefined)

  useEffect(() => {
    const obs = pipe(
      execution.tracker,
      tap(_stack => update(_stack)),
      finalize(() => update(undefined)),
      observe
    )

    return () => obs.stop()
  }, [ execution ])

  return stack
}
