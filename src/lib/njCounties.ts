/** NJ county social service agency contacts, checked against the official NJ DFD directory (November 4, 2026).
 * These are NJ county agencies, NOT Social Security field offices. Contact the agency
 * or check the source directory for current hours, holiday closures, satellite offices and changes.
 * Listed fax numbers are GENERAL AGENCY FAX NUMBERS: confirm the correct program-specific
 * fax destination with your caseworker before sending private financial documents.
 * Source: https://www.nj.gov/humanservices/dfd/counties/
 */
export const NJ_COUNTY_DIRECTORY_URL = 'https://www.nj.gov/humanservices/dfd/counties/';
export interface NjCountyAgency { county: string; agency: string; address: string; phone: string; fax: string; hours: string; notes?: string }
export const NJ_COUNTIES: readonly NjCountyAgency[] = [
  { county:'Atlantic', agency:'Atlantic County Department of Family and Community Development', address:'1333 Atlantic Avenue, Atlantic City, NJ 08401', phone:'609-348-3001', fax:'609-343-2374', hours:'Mon–Fri, 8:30 AM–4:30 PM' },
  { county:'Bergen', agency:'Bergen County Board of Social Services', address:'218 Route 17 North, Rochelle Park, NJ 07662', phone:'201-368-4200', fax:'201-368-8710', hours:'Mon–Fri, 8:00 AM–4:30 PM' },
  { county:'Burlington', agency:'Burlington County Board of Social Services', address:'795 Woodlane Road, Mount Holly, NJ 08060', phone:'609-261-1000', fax:'609-261-0463', hours:'Mon–Fri, 8:00 AM–4:30 PM' },
  { county:'Camden', agency:'Camden County Board of Social Services', address:'101 Woodcrest Road, Suite 161, Cherry Hill, NJ 08003', phone:'856-225-8800', fax:'856-225-7797', hours:'Mon–Fri, 8:30 AM–4:30 PM' },
  { county:'Cape May', agency:'Cape May County Department of Social Services', address:'3801 Route 9 South, Unit 4, Rio Grande, NJ 08242', phone:'609-886-6200', fax:'609-889-9332', hours:'Mon–Fri, 8:30 AM–4:30 PM' },
  { county:'Cumberland', agency:'Cumberland County Board of Social Services', address:'275 North Delsea Drive, Vineland, NJ 08360', phone:'856-691-4600', fax:'856-692-7635', hours:'Mon–Fri, 8:30 AM–4:30 PM' },
  { county:'Essex', agency:'Essex County Division of Family Assistance and Benefits', address:'320 University Avenue, 2nd Floor, Newark, NJ 07102', phone:'973-395-8000', fax:'973-504-9316', hours:'Mon–Fri, 8:00 AM–5:00 PM', notes:'Last appointment at 3:00 PM; limited emergency services 3:00–5:00 PM.' },
  { county:'Gloucester', agency:'Gloucester County Division of Social Services', address:'400 Hollydell Drive, Sewell, NJ 08080', phone:'856-582-9200', fax:'856-256-2214', hours:'Mon–Fri, 8:30 AM–3:30 PM' },
  { county:'Hudson', agency:'Hudson County Department of Family Services, Welfare Division', address:'257 Cornelison Avenue, Jersey City, NJ 07302', phone:'201-420-3000', fax:'201-395-4624', hours:'Mon–Fri, 8:30 AM–4:15 PM' },
  { county:'Hunterdon', agency:'Hunterdon County Division of Social Services', address:'6 Gauntt Place, Flemington, NJ 08822', phone:'908-788-1300', fax:'908-806-4588', hours:'Mon–Fri, 8:30 AM–4:30 PM' },
  { county:'Mercer', agency:'Mercer County Board of Social Services', address:'200 Woolverton Street, Trenton, NJ 08650', phone:'609-989-4320', fax:'609-394-6638', hours:'Mon–Fri, 8:30 AM–4:15 PM' },
  { county:'Middlesex', agency:'Middlesex County Board of Social Services', address:'181 How Lane, New Brunswick, NJ 08903', phone:'732-745-3500', fax:'732-745-4558', hours:'Mon–Fri, 8:30 AM–4:15 PM' },
  { county:'Monmouth', agency:'Monmouth County Division of Social Services', address:'3000 Kozloski Road, Freehold, NJ 07728', phone:'732-431-6000', fax:'732-577-6605', hours:'Mon–Fri, 8:30 AM–4:30 PM' },
  { county:'Morris', agency:'Morris County Office of Temporary Assistance', address:'340 West Hanover Avenue, Morristown, NJ 07963', phone:'973-326-7800', fax:'973-829-8531', hours:'Mon–Fri, 8:30 AM–4:30 PM' },
  { county:'Ocean', agency:'Ocean County Board of Social Services', address:'1005 Hooper Avenue, Toms River, NJ 08753', phone:'732-349-1500', fax:'732-244-8075', hours:'Mon–Fri, 8:30 AM–4:30 PM' },
  { county:'Passaic', agency:'Passaic County Board of Social Services', address:'80 Hamilton Street, Paterson, NJ 07505', phone:'973-881-0100', fax:'973-881-3233', hours:'Mon–Fri, 7:30 AM–4:00 PM' },
  { county:'Salem', agency:'Salem County Department of Social Services', address:'147 South Virginia Avenue, Penns Grove, NJ 08069', phone:'856-299-7200', fax:'856-299-3245', hours:'Mon–Fri, 8:00 AM–4:00 PM' },
  { county:'Somerset', agency:'Somerset County Board of Social Services', address:'73 East High Street, Somerville, NJ 08876', phone:'908-526-8800', fax:'908-707-1941', hours:'Mon–Fri, 8:15 AM–6:00 PM' },
  { county:'Sussex', agency:'Sussex County Division of Social Services', address:'83 Spring Street, Suite 203, Newton, NJ 07860', phone:'973-383-3600', fax:'973-383-3627', hours:'Mon–Fri, 8:30 AM–4:30 PM' },
  { county:'Union', agency:'Union County Division of Social Services', address:'342 Westminster Avenue, Elizabeth, NJ 07208', phone:'908-558-2288', fax:'908-965-2752', hours:'Mon–Fri, 8:30 AM–4:00 PM' },
  { county:'Warren', agency:'Warren County Division of Temporary Assistance and Social Services', address:'3 Shotwell Drive, Belvidere, NJ 07823', phone:'908-475-6301', fax:'908-475-1533', hours:'Mon–Fri, 8:30 AM–4:30 PM' },
];
export const getNjCountyAgency = (county: string) => NJ_COUNTIES.find(c => c.county === county);
