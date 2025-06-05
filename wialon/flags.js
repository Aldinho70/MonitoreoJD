export const flags = wialon.util.Number.or
(
    wialon.item.Unit.dataFlag.lastMessage,
    wialon.item.Unit.dataFlag.sensors,
    wialon.item.Item.dataFlag.base,
    wialon.item.Item.dataFlag.customFields,
    wialon.item.Item.dataFlag.adminFields,
    wialon.item.Item.dataFlag.messages,
    wialon.item.Resource.dataFlag.base,
    wialon.item.Resource.dataFlag.notifications,
    wialon.item.Resource.dataFlag.zones,
    wialon.item.Resource.dataFlag.reports,
    wialon.item.Item.dataFlag.billingProps
);
