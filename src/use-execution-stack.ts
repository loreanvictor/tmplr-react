import { Execution } from '@tmplr/core'
import { useEffect, useState } from 'react'
import { pipe, tap, finalize, observe } from 'streamlets'


export function useExecutionStack(execution: Execution<unknown>): any {
  const [ stack, update ] = useState<Execution<unknown>[] | undefined | any>(undefined)
  // const [counter, set] = useState(0)

  useEffect(() => {
    const obs = pipe(
      execution.tracker,
      tap(_stack => update(_stack.stack)),
      finalize(() => update(undefined)),
      observe
    )

    return () => obs.stop()
  }, [ execution ])

  return stack
}
