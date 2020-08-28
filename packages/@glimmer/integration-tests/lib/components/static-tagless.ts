import { BasicComponentManager } from './basic';
import { TestComponentDefinitionState } from './test-component';
import { ComponentCapabilities, CompilableProgram, Option } from '@glimmer/interfaces';
import TestJitRuntimeResolver from '../modes/jit/resolver';
import { createTemplate } from '../compile';
import { unwrapTemplate } from '@glimmer/util';

export class StaticTaglessComponentManager extends BasicComponentManager {
  getCapabilities(state: TestComponentDefinitionState): ComponentCapabilities {
    return state.capabilities;
  }

  getJitStaticLayout(
    state: TestComponentDefinitionState,
    resolver: TestJitRuntimeResolver
  ): CompilableProgram {
    let { name } = state;

    let handle = resolver.lookup('template-source', name)!;

    return unwrapTemplate(
      resolver.registry.customCompilableTemplate(handle, name, (source) =>
        createTemplate(source).create()
      )
    ).asLayout();
  }
}

export interface StaticTaglessComponentDefinitionState {
  name: string;
  layout: Option<number>;
  ComponentClass: any;
}
