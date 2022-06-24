import { ComponentSet, ExecutionInterface, ExecutionInterfaceProps, useExecutionStack } from '../index'


test('proper stuff are exported.', () => {
  expect(<ComponentSet>{}).not.toBeUndefined()
  expect(ExecutionInterface).not.toBeUndefined()
  expect(<ExecutionInterfaceProps>{}).not.toBeUndefined()
  expect(useExecutionStack).not.toBeUndefined()
})
