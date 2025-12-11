// data/notifications.ts
export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export const notifications: NotificationItem[] = [
  {
    id: "1",
    title: "Membership Activated",
    message: "Your Gold Membership is now active.",
    createdAt: "2025-01-04T10:30:00",
    read: false,
  },
  {
    id: "2",
    title: "New Diet Plan Added",
    message: "A new personalized diet plan has been added.",
    createdAt: "2025-01-03T14:12:00",
    read: true,
  },
  {
    id: "3",
    title: "Payment Successful",
    message: "Your last payment of $39.99 processed successfully.",
    createdAt: "2025-01-02T09:00:00",
    read: true,
  },
];
