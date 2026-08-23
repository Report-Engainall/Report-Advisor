export type CanonicalField='productCode'|'productName'|'unit'|'warehouse'|'openingBalance'|'inbound'|'outbound'|'salesQty'|'purchaseQty'|'currentStock'|'customerCode'|'customerName'|'supplierCode'|'supplierName'|'documentNo'|'documentDate'|'quantity'|'unitPrice'|'grossAmount'|'discount'|'netAmount'|'cost'|'profit'|'currency'|'dueDate';
export interface FieldDefinition{field:CanonicalField;aliases:string[];requiredFor?:string[];type:'text'|'number'|'date'|'currency';}
const definitions:FieldDefinition[]=[
{field:'productCode',aliases:['رقم الصنف','كود الصنف','رمز الصنف','كود المنتج','رقم المنتج','الصنف','Item Code','Product Code','SKU'],type:'text'},
{field:'productName',aliases:['اسم الصنف','اسم المنتج','بيان الصنف','اسم المادة','Item Name','Product Name','Description'],type:'text'},
{field:'unit',aliases:['الوحدة','وحدة القياس','Unit','UOM'],type:'text'},
{field:'warehouse',aliases:['المخزن','المستودع','المستودع الرئيسي','Warehouse','Store'],type:'text'},
{field:'openingBalance',aliases:['الرصيد الافتتاحي','رصيد أول المدة','Opening Balance'],type:'number'},
{field:'inbound',aliases:['الوارد','إجمالي الوارد','كمية الوارد','Inbound','Received Qty'],type:'number'},
{field:'outbound',aliases:['الصادر','إجمالي الصادر','كمية الصادر','Outbound','Issued Qty'],type:'number'},
{field:'salesQty',aliases:['الكمية المباعة','كمية المبيعات','صافي المبيعات كمية','Sales Qty','Sold Qty'],type:'number'},
{field:'purchaseQty',aliases:['كمية المشتريات','المشتريات كمية','Purchase Qty'],type:'number'},
{field:'currentStock',aliases:['الرصيد الحالي','الرصيد','الكمية المتوفرة','الكمية المتاحة','المخزون الحالي','Current Stock','Balance','On Hand'],type:'number'},
{field:'customerCode',aliases:['رقم العميل','كود العميل','رمز العميل','Customer Code'],type:'text'},
{field:'customerName',aliases:['اسم العميل','اسم الزبون','العميل','Customer Name','Customer'],type:'text'},
{field:'supplierCode',aliases:['رقم المورد','كود المورد','رمز المورد','Supplier Code'],type:'text'},
{field:'supplierName',aliases:['اسم المورد','المورد','Supplier Name','Supplier'],type:'text'},
{field:'documentNo',aliases:['رقم الفاتورة','رقم المستند','رقم السند','رقم الحركة','Document No','Invoice No'],type:'text'},
{field:'documentDate',aliases:['التاريخ','تاريخ الفاتورة','تاريخ المستند','تاريخ الحركة','Document Date','Invoice Date','Date'],type:'date'},
{field:'quantity',aliases:['الكمية','كمية','Quantity','Qty'],type:'number'},
{field:'unitPrice',aliases:['السعر','سعر الوحدة','سعر البيع','سعر الشراء','Unit Price','Price'],type:'currency'},
{field:'grossAmount',aliases:['الإجمالي','إجمالي القيمة','المبلغ الإجمالي','Gross Amount','Total'],type:'currency'},
{field:'discount',aliases:['الخصم','قيمة الخصم','Discount'],type:'currency'},
{field:'netAmount',aliases:['صافي المبيعات','الصافي','صافي القيمة','المبلغ الصافي','Net Amount','Net Sales'],type:'currency'},
{field:'cost',aliases:['التكلفة','تكلفة المبيعات','متوسط التكلفة','Cost','Cost of Sales','Average Cost'],type:'currency'},
{field:'profit',aliases:['الربح','إجمالي الربح','الربح الإجمالي','Profit','Gross Profit'],type:'currency'},
{field:'currency',aliases:['العملة','Currency'],type:'text'},
{field:'dueDate',aliases:['تاريخ الاستحقاق','الاستحقاق','Due Date'],type:'date'}];
export function getCanonicalFieldDefinitions(){return definitions;}
function norm(v:string){return v.trim().toLowerCase().replace(/[إأآ]/g,'ا').replace(/[ة]/g,'ه').replace(/[ًٌٍَُِّْ]/g,'').replace(/[\s_\-./]+/g,'');}
export function matchCanonicalField(header:string){const h=norm(header);for(const d of definitions){if(d.aliases.some(a=>norm(a)===h))return d.field;}return undefined;}
