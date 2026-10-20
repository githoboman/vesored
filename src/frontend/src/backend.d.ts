import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Portfolio {
    btcBalance: number;
    ethBalance: number;
    usdBalance: number;
}
export type Time = bigint;
export interface Transaction {
    transactionType: TransactionType;
    asset: string;
    timestamp: Time;
    amount: number;
}
export enum TransactionType {
    buy = "buy",
    sell = "sell",
    deposit = "deposit",
    withdrawal = "withdrawal"
}
export interface backendInterface {
    addTransaction(asset: string, amount: number, transactionType: TransactionType): Promise<void>;
    createOrUpdatePortfolio(btcBalance: number, ethBalance: number, usdBalance: number): Promise<void>;
    getAllPortfolios(): Promise<Array<Portfolio>>;
    getCryptoPrices(): Promise<[number, number]>;
    getPortfolio(): Promise<Portfolio>;
    getRiskScore(): Promise<number>;
    getTransactionHistory(): Promise<Array<Transaction>>;
}
