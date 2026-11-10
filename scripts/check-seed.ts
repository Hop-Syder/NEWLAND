import { buildSeedData } from "../src/lib/seed";
const { clients, adminOrders } = buildSeedData();
console.log("Commandes démo :", adminOrders.length);
for (const c of clients) {
  console.log(`${c.name} — cmd:${c.ordersCount} pts:${c.points} àvie:${c.lifetimePoints} dépensé:${c.totalSpent}`);
}
