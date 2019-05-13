/* This file is generated by build/debug.js */

export const enum MachineOp {
  PushFrame = 0,
  PopFrame = 1,
  InvokeVirtual = 2,
  InvokeStatic = 3,
  Jump = 4,
  Return = 5,
  ReturnTo = 6,
  Size = 7,
}

export const enum Op {
  Helper = 16,
  SetNamedVariables = 17,
  SetBlocks = 18,
  SetVariable = 19,
  SetAotBlock = 20,
  SetJitBlock = 21,
  GetVariable = 22,
  GetProperty = 23,
  GetBlock = 24,
  HasBlock = 25,
  HasBlockParams = 26,
  Concat = 27,
  Constant = 28,
  Primitive = 29,
  PrimitiveReference = 30,
  ReifyU32 = 31,
  Dup = 32,
  Pop = 33,
  Load = 34,
  Fetch = 35,
  RootScope = 36,
  VirtualRootScope = 37,
  ChildScope = 38,
  PopScope = 39,
  Text = 40,
  Comment = 41,
  AppendHTML = 42,
  AppendSafeHTML = 43,
  AppendDocumentFragment = 44,
  AppendNode = 45,
  AppendText = 46,
  OpenElement = 47,
  OpenDynamicElement = 48,
  PushRemoteElement = 49,
  StaticAttr = 50,
  DynamicAttr = 51,
  ComponentAttr = 52,
  FlushElement = 53,
  CloseElement = 54,
  PopRemoteElement = 55,
  Modifier = 56,
  BindDynamicScope = 57,
  PushDynamicScope = 58,
  PopDynamicScope = 59,
  CompileBlock = 60,
  PushBlockScope = 61,
  PushSymbolTable = 62,
  InvokeYield = 63,
  JumpIf = 64,
  JumpUnless = 65,
  JumpEq = 66,
  AssertSame = 67,
  Enter = 68,
  Exit = 69,
  ToBoolean = 70,
  EnterList = 71,
  ExitList = 72,
  PutIterator = 73,
  Iterate = 74,
  Main = 75,
  IsComponent = 76,
  ContentType = 77,
  CurryComponent = 78,
  PushComponentDefinition = 79,
  PushDynamicComponentInstance = 80,
  PushCurriedComponent = 81,
  ResolveDynamicComponent = 82,
  PushArgs = 83,
  PushEmptyArgs = 84,
  PopArgs = 85,
  PrepareArgs = 86,
  CaptureArgs = 87,
  CreateComponent = 88,
  RegisterComponentDestructor = 89,
  PutComponentOperations = 90,
  GetComponentSelf = 91,
  GetComponentTagName = 92,
  GetAotComponentLayout = 93,
  GetJitComponentLayout = 94,
  BindEvalScope = 95,
  SetupForEval = 96,
  PopulateLayout = 97,
  InvokeComponentLayout = 98,
  BeginComponentTransaction = 99,
  CommitComponentTransaction = 100,
  DidCreateElement = 101,
  DidRenderLayout = 102,
  InvokePartial = 103,
  ResolveMaybeLocal = 104,
  Debugger = 105,
  Size = 90,
}