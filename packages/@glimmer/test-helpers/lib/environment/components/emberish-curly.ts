import { ComponentCapabilities, WrappedBuilder } from "@glimmer/opcode-compiler";
import { Option, Opaque } from "@glimmer/interfaces";
import GlimmerObject from "@glimmer/object";
import { Tag, combine, PathReference, TagWrapper, DirtyableTag } from "@glimmer/reference";
import { EMPTY_ARRAY, assign, Destroyable } from "@glimmer/util";
import { Environment, Arguments, WithDynamicTagName, PreparedArguments, WithDynamicLayout, PrimitiveReference, ElementOperations, Bounds, CapturedNamedArguments, DynamicScope, Invocation } from "@glimmer/runtime";
import { UpdatableReference } from "@glimmer/object-reference";

import { Attrs, GenericComponentDefinition, GenericComponentManager, createTemplate, AttrsDiff } from "../shared";
import { TestSpecifier, TestResolver } from '../lazy-env';

export interface EmberishCurlyComponentFactory {
  positionalParams: Option<string | string[]>;
  create(options: { attrs: Attrs, targetObject: any }): EmberishCurlyComponent;
}

const CURLY_CAPABILITIES: ComponentCapabilities = {
  staticDefinitions: false,
  dynamicLayout: true,
  dynamicTag: true,
  prepareArgs: true,
  createArgs: true,
  attributeHook: true,
  elementHook: true
};

export class EmberishCurlyComponentDefinition extends GenericComponentDefinition<EmberishCurlyComponent> {
  public ComponentClass: EmberishCurlyComponentFactory;

  public capabilities: ComponentCapabilities = CURLY_CAPABILITIES;
}

export class AbstractEmberishCurlyComponentManager extends GenericComponentManager implements WithDynamicTagName<EmberishCurlyComponent> {
  prepareArgs(definition: EmberishCurlyComponentDefinition, args: Arguments): Option<PreparedArguments> {
    const { positionalParams } = definition.ComponentClass || BaseEmberishCurlyComponent;

    if (typeof positionalParams === 'string') {
      if (args.named.has(positionalParams)) {
        if (args.positional.length === 0) {
          return null;
        } else {
          throw new Error(`You cannot specify positional parameters and the hash argument \`${positionalParams}\`.`);
        }
      }

      let named = Object.assign({}, args.named.capture().map);
      named[positionalParams] = args.positional.capture();

      return { positional: EMPTY_ARRAY, named };
    } else if (Array.isArray(positionalParams)) {
      let named = Object.assign({}, args.named.capture().map);
      let count = Math.min(positionalParams.length, args.positional.length);

      for (let i=0; i<count; i++) {
        let name = positionalParams[i];

        if (named[name]) {
          throw new Error(`You cannot specify both a positional param (at position ${i}) and the hash argument \`${name}\`.`);
        }

        named[name] = args.positional.at(i);
      }

      return { positional: EMPTY_ARRAY, named };
    } else {
      return null;
    }
  }

  create(_environment: Environment, definition: EmberishCurlyComponentDefinition, _args: Arguments, dynamicScope: DynamicScope, callerSelf: PathReference<Opaque>, hasDefaultBlock: boolean): EmberishCurlyComponent {
    let klass = definition.ComponentClass || BaseEmberishCurlyComponent;
    let self = callerSelf.value();
    let args = _args.named.capture();
    let attrs = args.value();
    let merged = assign({}, attrs, { attrs }, { args }, { targetObject: self }, { HAS_BLOCK: hasDefaultBlock });
    let component = klass.create(merged);

    component.name = definition.name;
    component.args = args;

    if (definition.layout) {
      component.layout = { name: component.name, handle: definition.layout };
    }

    let dyn: Option<string[]> = definition.ComponentClass ? definition.ComponentClass['fromDynamicScope'] : null;

    if (dyn) {
      for (let i = 0; i < dyn.length; i++) {
        let name = dyn[i];
        component.set(name, dynamicScope.get(name).value());
      }
    }

    component.didInitAttrs({ attrs });
    component.didReceiveAttrs({ oldAttrs: null, newAttrs: attrs });
    component.willInsertElement();
    component.willRender();

    return component;
  }

  getTag({ args: { tag }, dirtinessTag }: EmberishCurlyComponent): Tag {
    return combine([tag, dirtinessTag]);
  }

  getSelf(component: EmberishCurlyComponent): PathReference<Opaque> {
    return new UpdatableReference(component);
  }

  getTagName({ tagName }: EmberishCurlyComponent): Option<string> {
    if (tagName) {
      return tagName;
    } else if (tagName === null) {
      return 'div';
    } else {
      return null;
    }
  }

  didCreateElement(component: EmberishCurlyComponent, element: Element, operations: ElementOperations): void {
    component.element = element;

    operations.setAttribute('id', PrimitiveReference.create(`ember${component._guid}`), false, null);
    operations.setAttribute('class', PrimitiveReference.create('ember-view'), false, null);

    let bindings = component.attributeBindings;
    let rootRef = new UpdatableReference(component);

    if (bindings) {
      for (let i = 0; i < bindings.length; i++) {
        let attribute = bindings[i];
        let reference = rootRef.get(attribute) as PathReference<string>;

        operations.setAttribute(attribute, reference, false, null);
      }
    }
  }

  didRenderLayout(component: EmberishCurlyComponent, bounds: Bounds): void {
    component.bounds = bounds;
  }

  didCreate(component: EmberishCurlyComponent): void {
    component.didInsertElement();
    component.didRender();
  }

  update(component: EmberishCurlyComponent): void {
    let oldAttrs = component.attrs;
    let newAttrs = component.args.value();
    let merged = assign({}, newAttrs, { attrs: newAttrs });

    component.setProperties(merged);
    component.didUpdateAttrs({ oldAttrs, newAttrs });
    component.didReceiveAttrs({ oldAttrs, newAttrs });
    component.willUpdate();
    component.willRender();
  }

  didUpdateLayout(): void { }

  didUpdate(component: EmberishCurlyComponent): void {
    component.didUpdate();
    component.didRender();
  }

  getDestructor(component: EmberishCurlyComponent): Destroyable {
    return {
      destroy() {
        component.destroy();
      }
    };
  }
}

export class EmberishCurlyComponentManager extends AbstractEmberishCurlyComponentManager implements WithDynamicLayout<EmberishCurlyComponent, TestSpecifier, TestResolver> {
  getLayout({ layout }: EmberishCurlyComponent, resolver: TestResolver): Invocation {
    if (!layout) {
      throw new Error('BUG: missing dynamic layout');
    }

    let handle = resolver.lookup('template-source', layout.name);

    if (!handle) {
      throw new Error('BUG: missing dynamic layout');
    }

    return resolver.compileTemplate(handle, layout.name, (source, options) => {
      let template = createTemplate(source);
      let builder = new WrappedBuilder({ ...options, asPartial: false, referer: null }, template, CURLY_CAPABILITIES);
      return {
        handle: builder.compile(),
        symbolTable: builder.symbolTable
      };
    });
  }

}

export class EmberishCurlyComponent extends GlimmerObject {
  public static positionalParams: string[] | string;

  public dirtinessTag: TagWrapper<DirtyableTag> = DirtyableTag.create();
  public layout: { name: string, handle: number };
  public name: string;
  public tagName: Option<string> = null;
  public attributeBindings: Option<string[]> = null;
  public attrs: Attrs;
  public element: Element;
  public bounds: Bounds;
  public parentView: Option<EmberishCurlyComponent> = null;
  public args: CapturedNamedArguments;

  static create(args: { attrs: Attrs }): EmberishCurlyComponent {
    return super.create(args) as EmberishCurlyComponent;
  }

  recompute() {
    this.dirtinessTag.inner.dirty();
  }

  didInitAttrs(_options: { attrs: Attrs }) { }
  didUpdateAttrs(_diff: AttrsDiff) { }
  didReceiveAttrs(_diff: AttrsDiff) { }
  willInsertElement() { }
  willUpdate() { }
  willRender() { }
  didInsertElement() { }
  didUpdate() { }
  didRender() { }
}

export const BaseEmberishCurlyComponent = EmberishCurlyComponent.extend() as typeof EmberishCurlyComponent;
export const EMBERISH_CURLY_COMPONENT_MANAGER = new EmberishCurlyComponentManager();
