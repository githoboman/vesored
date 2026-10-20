import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactionHistory } from "@/hooks/useQueries";
import { TransactionType } from "../backend.d";

type StatusType = "completed" | "pending" | "failed";

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    asset: "BOT",
    type: "buy",
    amount: 1250,
    price: 0.75,
    status: "completed",
    time: "Just now",
  },
  {
    id: 2,
    asset: "BTC",
    type: "buy",
    amount: 0.12,
    price: 65420,
    status: "completed",
    time: "2 min ago",
  },
  {
    id: 2,
    asset: "ETH",
    type: "sell",
    amount: 2.5,
    price: 3280.5,
    status: "completed",
    time: "18 min ago",
  },
  {
    id: 3,
    asset: "SOL",
    type: "buy",
    amount: 50,
    price: 148.3,
    status: "pending",
    time: "1 hr ago",
  },
  {
    id: 4,
    asset: "BTC",
    type: "sell",
    amount: 0.05,
    price: 64800,
    status: "completed",
    time: "3 hr ago",
  },
  {
    id: 5,
    asset: "ETH",
    type: "buy",
    amount: 1.8,
    price: 3310,
    status: "failed",
    time: "5 hr ago",
  },
  {
    id: 6,
    asset: "BTC",
    type: "buy",
    amount: 0.25,
    price: 63200,
    status: "completed",
    time: "1 day ago",
  },
  {
    id: 7,
    asset: "SOL",
    type: "sell",
    amount: 100,
    price: 152.1,
    status: "completed",
    time: "2 days ago",
  },
];

const STATUS_STYLE: Record<
  StatusType,
  { color: string; bg: string; label: string }
> = {
  completed: {
    color: "oklch(0.70 0.17 145)",
    bg: "oklch(0.70 0.17 145 / 0.12)",
    label: "Completed",
  },
  pending: {
    color: "oklch(0.82 0.17 85)",
    bg: "oklch(0.82 0.17 85 / 0.12)",
    label: "Pending",
  },
  failed: {
    color: "oklch(0.63 0.22 27)",
    bg: "oklch(0.63 0.22 27 / 0.12)",
    label: "Failed",
  },
};

function toDisplayType(t: TransactionType | string): string {
  if (t === TransactionType.buy || t === "buy") return "Buy";
  if (t === TransactionType.sell || t === "sell") return "Sell";
  return String(t);
}

function HoverableRow({
  children,
  ocid,
}: {
  children: React.ReactNode;
  ocid: string;
}) {
  const handleEnter = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.background = "oklch(1 0 0 / 0.03)";
  };
  const handleLeave = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.background = "transparent";
  };
  return (
    <TableRow
      className="border-white/[0.05] transition-colors cursor-default"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      data-ocid={ocid}
    >
      {children}
    </TableRow>
  );
}

export function TransactionsTable() {
  const { data: backendTxs } = useTransactionHistory();

  const rows =
    backendTxs && backendTxs.length > 0
      ? backendTxs.map((tx, i) => ({
          id: i + 1,
          asset: tx.asset,
          type: tx.transactionType,
          amount: tx.amount,
          price:
            tx.asset === "BTC" ? 65420 : tx.asset === "ETH" ? 3280.5 : 148.3,
          status: "completed" as StatusType,
          time: new Date(Number(tx.timestamp) / 1_000_000).toLocaleTimeString(),
        }))
      : MOCK_TRANSACTIONS;

  return (
    <div
      className="glass rounded-2xl overflow-hidden animate-fade-in-up delay-400"
      data-ocid="transactions.table"
    >
      <div className="px-6 py-5 border-b border-white/[0.07]">
        <h2 className="text-base font-bold">Recent Transactions</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Latest trading activity
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.07] hover:bg-transparent">
              <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Asset
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Type
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider text-right">
                Amount
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider text-right">
                Price
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-semibold uppercase tracking-wider text-right">
                Time
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((tx, i) => {
              const statusKey = (
                typeof tx.status === "string" ? tx.status : "completed"
              ) as StatusType;
              const statusCfg =
                STATUS_STYLE[statusKey] ?? STATUS_STYLE.completed;
              const isBuy =
                tx.type === TransactionType.buy || tx.type === "buy";
              return (
                <HoverableRow key={tx.id} ocid={`transactions.item.${i + 1}`}>
                  <TableCell className="font-semibold text-sm py-3.5">
                    {tx.asset}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        color: isBuy
                          ? "oklch(0.52 0.22 284)"
                          : "oklch(0.63 0.22 27)",
                        background: isBuy
                          ? "oklch(0.52 0.22 284 / 0.12)"
                          : "oklch(0.63 0.22 27 / 0.12)",
                      }}
                    >
                      {toDisplayType(tx.type)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm py-3.5 font-mono">
                    {tx.amount}
                  </TableCell>
                  <TableCell className="text-right text-sm py-3.5 font-mono">
                    ${tx.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        color: statusCfg.color,
                        background: statusCfg.bg,
                      }}
                    >
                      {statusCfg.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground py-3.5">
                    {tx.time}
                  </TableCell>
                </HoverableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
