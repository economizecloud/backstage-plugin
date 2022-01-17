export const GetQuery = {
  weeklyCost(
    table: string,
    database: string,
    start_date: string,
    isCredit: boolean,
  ) {
    return `
    SELECT (YEAR(line_item_usage_start_date) * 100) + WEEK(line_item_usage_start_date) as Week,
	  sum(line_item_unblended_cost) as cost
    FROM "${database}"."${table}"
    WHERE 
    ${isCredit ? `line_item_line_item_type = 'Credit' AND` : ``}
	   line_item_usage_start_date > DATE('${start_date}')
    group by 1
    order by 1;
    `;
  },
  top10Services(
    table: string,
    database: string,
    start_date: string,
    isCredit: boolean,
  ) {
    return `
  select "line_item_product_code",
	date(bill_billing_period_start_date),
	round(sum("line_item_unblended_cost"), 2) as cost,
  product_product_name
  from "${database}"."${table}"
  where
  ${isCredit ? ` line_item_line_item_type = 'Credit' AND` : ``}
	 bill_billing_period_start_date > Date('${start_date}')
  group by 1,2,4
  order by 2;
    `;
  },
};
