"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon data-slot="accordion-trigger-icon" className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden" />
        <ChevronUpIcon data-slot="accordion-trigger-icon" className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      /* forceMount, so every answer is in the served HTML whether its panel is open or not.
         Radix unmounts a closed panel by default, which meant a page with ten FAQs shipped
         one answer and nine empty triggers: fine for a person who can click, but a crawler
         reads the HTML once and never clicks, so nine tenths of the copy was invisible to
         search and to the AI assistants these blocks exist to feed.

         NOTHING ANIMATES ON THIS ELEMENT, and that is not a style preference. Radix's own
         layout effect runs on every open and close and does this to the node it controls:

             node.style.transitionDuration = '0s'
             node.style.animationName = 'none'
             node.getBoundingClientRect()          // forces a style flush
             ...restore

         The flush happens while the duration is still zeroed, so a transition declared here
         is evaluated as instant and has already finished by the time the duration is put
         back. The animation therefore lives on the track div below, which Radix does not
         touch, and reads the open state off this element as an ancestor instead.

         That ancestor selector is pinned to [data-slot=accordion-content] rather than to a
         bare [data-state=open]. Radix stamps data-state on plenty of things, so the loose
         form would expand every panel in here the day someone puts an accordion inside an
         open Dialog or Collapsible. */
      forceMount
      data-slot="accordion-content"
      className="text-sm"
      {...props}
    >
      {/*
        The collapse, as a grid row from 0fr to 1fr.

        WHY NOT THE HEIGHT KEYFRAMES THIS REPLACED, which is the whole bug. Those animate to
        `var(--radix-accordion-content-height)`, which Radix fills from getBoundingClientRect
        on the panel. Under forceMount the panel is hidden rather than unmounted, and you
        cannot measure a hidden element: the rect comes back 0, Radix drops the variable
        rather than write `0px`, and the keyframe falls through to its `auto` fallback.
        `height: 0` to `height: auto` is not interpolatable, so CSS interpolates it discretely
        and flips at the halfway point. That is the flicker: the panel sat collapsed for half
        the duration and then popped to full height.

        A 0fr to 1fr row needs no measurement, so nothing has to be readable to be animated.

        VISIBILITY IS IN THE TRANSITION ON PURPOSE. It is what replaces the display:none this
        used to rely on, and it is why the collapse is now watchable. Transitioning visibility
        from visible interpolates discretely but holds `visible` for the whole duration and
        flips only at the end, so the panel stays on screen while it closes and leaves the
        accessibility tree once it is shut. A screen reader still reaches only the open panel,
        and every word is still in the HTML for a crawler.
      */}
      <div className="invisible grid grid-rows-[0fr] transition-[grid-template-rows,visibility] duration-300 ease-out [[data-slot=accordion-content][data-state=open]_&]:visible [[data-slot=accordion-content][data-state=open]_&]:grid-rows-[1fr] motion-reduce:transition-none">
        {/* min-h-0 defeats the `auto` minimum a grid item gets by default, which would
            otherwise hold the row open at content height and make 0fr do nothing. */}
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              "pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
              className
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
