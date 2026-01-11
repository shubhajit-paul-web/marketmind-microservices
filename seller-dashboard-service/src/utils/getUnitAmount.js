// Small helper: safely read the unit price from an order item (prefer discountPrice if it exists)
const getUnitAmount = (price) => {
    const amount = price?.discountPrice ?? price?.amount;
    const num = Number(amount ?? 0);
    return Number.isFinite(num) ? num : 0;
};

export default getUnitAmount;
