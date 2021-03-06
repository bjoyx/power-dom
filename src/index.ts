import h from "snabbdom/h"
import * as snabbdom from "snabbdom"
import {types, style as $style} from "typestyle"
export type NestedCSSProperties = types.NestedCSSProperties
import snabbdomClass from "snabbdom/modules/class"
import snabbdomProps from "snabbdom/modules/props"
import snabbdomAttrs from "snabbdom/modules/attributes"
import snabbdomStyle from "snabbdom/modules/style"
import snabbdomListeners from "snabbdom/modules/eventlisteners"
import snabbdomThunk, {ThunkFn} from "snabbdom/thunk"

import {VNode, VNodeData} from "snabbdom/vnode"
export type VNode = VNode
export type VNodeData = VNodeData

export const thunk = snabbdomThunk
export const hh = h

import {
  isString, isArray, isDefined, isUndefined, log, OneOrMore, Nothing, exists, Maybe
} from "power-belt"

interface Global extends Window {
  // make view a global because cannot `x = x || y` when x is a local
  view: VNode | HTMLElement
}
const global = window as Global

const snabbdomPatch = snabbdom.init([
  snabbdomClass,
  snabbdomProps,
  snabbdomAttrs,
  snabbdomStyle,
  snabbdomListeners
])

export const patch = (domElemId: string) => (vnode: VNode) =>
  global.view = snabbdomPatch(
    global.view || document.getElementById(domElemId) as HTMLElement,
    h("div#" + domElemId, vnode)
  )

interface Name {
  name: string
}

export type Content = OneOrMore<string|VNode|Nothing>
export type CssClass = OneOrMore<string|Nothing>

export interface HyperScriptFunc {
  (): VNode
  (content: Content): VNode
  (data: VNodeData): VNode
  (data: VNodeData, content: Content): VNode
  (cssClass: CssClass, content: Content): VNode
  (cssClass: CssClass, data: VNodeData): VNode
  (cssClass: CssClass, data: VNodeData, content: Content): VNode
}

const isContent = (x: Maybe<VNodeData|Content>) =>
  x && (isString(x) || isArray(x) || (x as VNode).sel)

export const tag = (type: string): HyperScriptFunc =>
  (a?: CssClass|VNodeData|Content, b?: VNodeData|Content, c?: Content) => {
    if (isUndefined(a)) {
      return h(type)
    } else if (isUndefined(b)) {
      return h(type, a as any) // a is Content
    } else if (isString(a) || isArray(a)) {
      const $classes = isString(a) ? [a] : isArray(a) ? a : []
      const classes = {} as {[name: string]: boolean}
      for (const klass of $classes) classes[klass] = true
      if (c || !isContent(b)) {
        const vnd = b as VNodeData
        b = {...vnd, class: classes}
      } else {
        c = b as Content
        b = {class: classes}
      }
      return h(type, b as any, c as any)
    } else {
      return h(type, a as any, b as any)
    }
  }

export const h1 = tag("h1")
export const h2 = tag("h2")
export const h3 = tag("h3")
export const h4 = tag("h4")
export const h5 = tag("h5")
export const h6 = tag("h6")
export const div = tag("div")
export const span = tag("span")
export const p = tag("p")
export const ul = tag("ul")
export const ol = tag("ol")
export const li = tag("li")
export const input = tag("input")
export const textarea = tag("textarea")
export const img = tag("img")
export const a = tag("a")

export const br = h("br")

export const iframe = tag("iframe")

const svgTag = (type: string) => {
  const t = tag(type)
  return (attrs: any, children?: string | VNode[]) =>
    children ? t({attrs}, children as string) : t({attrs})
}

export const svg = svgTag("svg")
export const polygon = svgTag("polygon")
export const text = svgTag("text")
export const circle = svgTag("circle")
export const animateTransform = svgTag("animateTransform")

const replaceWithBr = (str: string, target: string) =>
  str.split(target).reduce(
    (parts, part) => parts.concat([part, br]),
    [] as (string|VNode)[]
  ).slice(0, -1)

export const newlineToBr = (str: string) => replaceWithBr(str, "\n")
export const newlineStrToBr = (str: string) => replaceWithBr(str, "\\n")

export type Style = Maybe<string | string[] | NestedCSSProperties>
export const style = (...css: Style[]) => {
  const classNames: string[] = []
  const cssProperties: NestedCSSProperties[] = []
  for (const it of css) {
    if (isString(it)) {
      classNames.push(it)
    } else if (isArray(it)) {
      classNames.push(...it)
    } else if (exists(it)) {
      cssProperties.push(it)
    }
  }
  const result = [...classNames]
  if (cssProperties.length) result.push($style(...cssProperties))
  return result.length > 1 ? result : result[0]
}
