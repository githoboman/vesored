import Float "mo:core/Float";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";

actor {
  type Portfolio = {
    btcBalance : Float;
    ethBalance : Float;
    usdBalance : Float;
  };

  module Portfolio {
    public func compare(p1 : Portfolio, p2 : Portfolio) : Order.Order {
      Float.compare(p1.usdBalance, p2.usdBalance);
    };
  };

  type Transaction = {
    timestamp : Time.Time;
    asset : Text;
    amount : Float;
    transactionType : TransactionType;
  };

  type TransactionType = {
    #buy;
    #sell;
    #deposit;
    #withdrawal;
  };

  let portfolios = Map.empty<Principal, Portfolio>();
  let transactions = Map.empty<Principal, [Transaction]>();

  var btcPrice = 50000.0;
  var ethPrice = 2500.0;

  public shared ({ caller }) func createOrUpdatePortfolio(btcBalance : Float, ethBalance : Float, usdBalance : Float) : async () {
    let portfolio : Portfolio = {
      btcBalance;
      ethBalance;
      usdBalance;
    };
    portfolios.add(caller, portfolio);
  };

  public query ({ caller }) func getPortfolio() : async Portfolio {
    switch (portfolios.get(caller)) {
      case (null) { Runtime.trap("Portfolio does not exist") };
      case (?portfolio) { portfolio };
    };
  };

  public query ({ caller }) func getRiskScore() : async Float {
    switch (portfolios.get(caller)) {
      case (null) { Runtime.trap("Portfolio does not exist") };
      case (?p) {
        let btcValue = p.btcBalance * btcPrice;
        let ethValue = p.ethBalance * ethPrice;
        let totalValue = btcValue + ethValue + p.usdBalance;
        let cryptoPortion = (btcValue + ethValue) / totalValue;
        if (cryptoPortion > 0.7) {
          0.9; // High risk
        } else if (cryptoPortion > 0.4) {
          0.6; // Medium risk
        } else {
          0.3; // Low risk
        };
      };
    };
  };

  public shared ({ caller }) func addTransaction(asset : Text, amount : Float, transactionType : TransactionType) : async () {
    let newTransaction = {
      timestamp = Time.now();
      asset;
      amount;
      transactionType;
    };

    let userTransactions = switch (transactions.get(caller)) {
      case (null) { [] };
      case (?t) { t };
    };
    let updatedTransactions = userTransactions.concat([newTransaction]);
    transactions.add(caller, updatedTransactions);
  };

  public query ({ caller }) func getTransactionHistory() : async [Transaction] {
    switch (transactions.get(caller)) {
      case (null) { [] };
      case (?t) { t };
    };
  };

  public query ({ caller }) func getCryptoPrices() : async (Float, Float) {
    (btcPrice, ethPrice);
  };

  public query ({ caller }) func getAllPortfolios() : async [Portfolio] {
    portfolios.values().toArray().sort();
  };
};
