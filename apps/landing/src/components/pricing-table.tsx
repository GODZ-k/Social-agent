import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@repo/ui/components/states";
import { PLANS, PLAN_ROWS, type Plan } from "@/lib/content/pricing";
import { signUpUrl } from "@/lib/site";

// One primary action per view: the plan most people should pick. The others stay quiet.
const PRIMARY_PLAN = "growth";

function PlanAction({ plan }: { plan: Plan }) {
  const variant = plan.id === PRIMARY_PLAN ? "default" : "secondary";
  return (
    <Button variant={variant} asChild>
      {plan.href === "contact" ? <Link href="/contact">{plan.cta}</Link> : <a href={signUpUrl()}>{plan.cta}</a>}
    </Button>
  );
}

function Value({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <>
        <Check className="size-4 text-success" aria-hidden />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus className="size-4 text-muted-foreground/60" aria-hidden />
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="tabular-nums">{value}</span>;
}

function PlanHeading({ plan }: { plan: Plan }) {
  return (
    <>
      <p className="type-heading">{plan.name}</p>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
        <span className="type-number text-3xl">{plan.price}</span>
        <span className="type-label">{plan.cadence}</span>
      </p>
      <p className="mt-2 text-muted-foreground">{plan.summary}</p>
    </>
  );
}

/** A plain comparison: a table from `md`, and one card per plan on phones where three columns can't fit. */
export function PricingTable() {
  return (
    <>
      <Panel className="p-0 max-md:hidden md:p-0">
        <table className="w-full table-fixed border-collapse text-left">
          <caption className="sr-only">What each plan includes</caption>
          <thead>
            <tr>
              <td className="w-[28%]" />
              {PLANS.map((plan) => (
                <th key={plan.id} scope="col" className="p-6 align-top font-normal">
                  <PlanHeading plan={plan} />
                  <div className="mt-5">
                    <PlanAction plan={plan} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_ROWS.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th scope="row" className="py-3.5 pr-4 pl-6 font-normal text-muted-foreground">
                  {row.label}
                </th>
                {row.values.map((value, i) => (
                  <td key={PLANS[i]!.id} className="px-6 py-3.5">
                    <Value value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <div className="grid gap-5 md:hidden">
        {PLANS.map((plan, i) => (
          <Panel key={plan.id} aria-label={plan.name}>
            <PlanHeading plan={plan} />
            <dl className="mt-5 divide-y divide-border border-y border-border">
              {PLAN_ROWS.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="min-w-0 text-muted-foreground">{row.label}</dt>
                  <dd className="shrink-0 text-right">
                    <Value value={row.values[i]!} />
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5">
              <PlanAction plan={plan} />
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
