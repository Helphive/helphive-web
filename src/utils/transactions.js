import visa from "../../assets/icons/balance/visa.png";
import creditcard from "../../assets/icons/balance/credit-card.png";
import mastercard from "../../assets/icons/balance/master-card.png";
import paypal from "../../assets/icons/balance/paypal.png";
import payoneer from "../../assets/icons/balance/payoneer.png";
import bank from "../../assets/icons/balance/link-with-bank.png";

const transactions = [
    {
        id: 1,
        dateTime: new Date("2023-10-01T10:00:00"),
        status: "Completed",
        withdrawMethod: "Bank Transfer",
        icon: bank,
        amount: 150.0,
        currency: "USD",
    },
    {
        id: 2,
        dateTime: new Date("2023-10-02T14:30:00"),
        status: "Pending",
        withdrawMethod: "PayPal",
        icon: paypal,
        amount: 75.5,
        currency: "USD",
    },
    {
        id: 3,
        dateTime: new Date("2023-10-03T09:15:00"),
        status: "Failed",
        withdrawMethod: "Credit Card",
        icon: creditcard,
        amount: 200.0,
        currency: "USD",
    },
    {
        id: 4,
        dateTime: new Date("2023-10-04T16:45:00"),
        status: "Completed",
        withdrawMethod: "Bank Transfer",
        icon: bank,
        amount: 320.75,
        currency: "USD",
    },
    {
        id: 5,
        dateTime: new Date("2023-10-05T11:00:00"),
        status: "Pending",
        withdrawMethod: "PayPal",
        icon: paypal,
        amount: 50.0,
        currency: "USD",
    },
    {
        id: 6,
        dateTime: new Date("2023-10-06T13:20:00"),
        status: "Completed",
        withdrawMethod: "Visa",
        icon: visa,
        amount: 180.0,
        currency: "USD",
    },
    {
        id: 7,
        dateTime: new Date("2023-10-07T15:45:00"),
        status: "Failed",
        withdrawMethod: "Payoneer",
        icon: payoneer,
        amount: 90.0,
        currency: "USD",
    },
    {
        id: 8,
        dateTime: new Date("2023-10-08T08:30:00"),
        status: "Completed",
        withdrawMethod: "MasterCard",
        icon: mastercard,
        amount: 250.0,
        currency: "USD",
    },
];

export default transactions;
