import { AccessLevel } from '@prisma/client';

/**
 * Standard Data Room section template (spec §10). When an owner initializes an
 * opportunity's data room, these top-level folders are created. Most require an
 * NDA grant; a couple of high-level sections are visible to any registered user
 * as a preview. Codes match the canonical section index.
 */
export interface DataRoomSection {
  code: string;
  name: string;
  minAccessLevel: AccessLevel;
}

export const DATAROOM_SECTIONS: DataRoomSection[] = [
  { code: '01', name: 'Project Fact Sheet', minAccessLevel: 'REGISTERED' },
  { code: '02', name: 'Project Location', minAccessLevel: 'NDA' },
  { code: '03', name: 'Feasibility Studies', minAccessLevel: 'NDA' },
  { code: '04', name: 'Valuation Reports', minAccessLevel: 'NDA' },
  { code: '05', name: 'Market Study', minAccessLevel: 'REGISTERED' },
  { code: '06', name: 'Title Deed & Ownership Documents', minAccessLevel: 'NDA' },
  { code: '07', name: 'Plot, Affection & Allocation Plans', minAccessLevel: 'NDA' },
  { code: '08', name: 'Permits & Government Approvals', minAccessLevel: 'NDA' },
  { code: '09', name: 'NOCs', minAccessLevel: 'NDA' },
  { code: '10', name: 'Due Diligence', minAccessLevel: 'DUE_DILIGENCE' },
  { code: '11', name: 'Legal Forms, Agreements & Drafts', minAccessLevel: 'NDA' },
  { code: '12', name: 'Government Tender Documents', minAccessLevel: 'NDA' },
  { code: '13', name: 'Videos & Drone Footage', minAccessLevel: 'NDA' },
  { code: '14', name: 'AutoCAD, BIM & Technical Files', minAccessLevel: 'NDA' },
  { code: '15', name: '3D Renders & Masterplan', minAccessLevel: 'NDA' },
  { code: '16', name: 'Interior Design & Specifications', minAccessLevel: 'NDA' },
  { code: '17', name: 'Commercial Proposal & JV Terms', minAccessLevel: 'NDA' },
  { code: '18', name: 'Financial Documents & Financing', minAccessLevel: 'NDA' },
  { code: '19', name: 'Developer', minAccessLevel: 'NDA' },
  { code: '20', name: 'Investors & Equity Partners', minAccessLevel: 'NDA' },
  { code: '21', name: 'Banks & Financing Institutions', minAccessLevel: 'NDA' },
  { code: '22', name: 'Main Contractor', minAccessLevel: 'NDA' },
  { code: '23', name: 'Subcontractors & Specialist Contractors', minAccessLevel: 'NDA' },
  { code: '24', name: 'Lead Consultant & Architect', minAccessLevel: 'NDA' },
  { code: '25', name: 'Engineering Consultants', minAccessLevel: 'NDA' },
  { code: '26', name: 'Project Manager & Development Manager', minAccessLevel: 'NDA' },
  { code: '27', name: 'Quantity Surveyor & Cost Consultant', minAccessLevel: 'NDA' },
  { code: '28', name: 'Interior Designer', minAccessLevel: 'NDA' },
  { code: '29', name: 'Landscape Designer', minAccessLevel: 'NDA' },
  { code: '30', name: 'Operator', minAccessLevel: 'NDA' },
  { code: '31', name: 'Brand & Branded Residences', minAccessLevel: 'NDA' },
  { code: '32', name: 'Sales, Marketing & Brokerage Companies', minAccessLevel: 'NDA' },
  { code: '33', name: 'Facility & Property Management', minAccessLevel: 'NDA' },
  { code: '34', name: 'Technology & PropTech Companies', minAccessLevel: 'NDA' },
  { code: '35', name: 'Insurance Companies', minAccessLevel: 'NDA' },
  { code: '36', name: 'Lawyers, Auditors & Tax Advisors', minAccessLevel: 'NDA' },
  { code: '37', name: 'Other Project Companies', minAccessLevel: 'NDA' },
  { code: '38', name: 'Questions & Answers', minAccessLevel: 'NDA' },
  { code: '39', name: 'Meetings & Site Visits', minAccessLevel: 'NDA' },
  { code: '40', name: 'Expressions of Interest & Offers', minAccessLevel: 'NDA' },
  { code: '41', name: 'Consortium Documents', minAccessLevel: 'NDA' },
  { code: '42', name: 'Preferred Bidder Documents', minAccessLevel: 'DUE_DILIGENCE' },
  { code: '43', name: 'Financial Close Documents', minAccessLevel: 'TRANSACTION' },
  { code: '44', name: 'Executed Agreements', minAccessLevel: 'TRANSACTION' },
  { code: '45', name: 'Project Delivery Documents', minAccessLevel: 'TRANSACTION' },
  { code: '46', name: 'Operations & Maintenance', minAccessLevel: 'TRANSACTION' },
  { code: '47', name: 'Handback Documents', minAccessLevel: 'TRANSACTION' },
  { code: '48', name: 'Other Documents', minAccessLevel: 'NDA' },
];
