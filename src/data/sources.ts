export interface Source {
  label: string
  url: string
}

export const SOURCES: Record<string, Source[]> = {
  Spain: [
    { label: 'AEAT — Manual Renta, state scale (art. 63 LIRPF)', url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-estatal.html' },
    { label: 'Ministerio de Hacienda — Tributación Autonómica, Medidas 2026', url: 'https://www.hacienda.gob.es/sgfal/financiacionterritorial/autonomica/capitulo-iv-tributacion-autonomica-2026.pdf' },
    { label: 'BOE — Ley 5/2026 Comunitat Valenciana (2026 scale)', url: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-19331' },
    { label: 'AEAT — Reducción por rendimientos del trabajo (art. 20)', url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c03-rendimientos-trabajo/rendimiento-neto-trabajo-integrar-base-imponible/fase-3-determinacion-rendimiento-neto-reducido.html' },
    { label: 'Hacienda — SMI deduction 2026 (RD-ley 5/2026)', url: 'https://www.hacienda.gob.es/ca-ES/Prensa/Noticias/Paginas/2026/20260217-NP-CM-SMI-DEDUCCION-2026.aspx' },
    { label: 'Seguridad Social — bases y tipos 2026', url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537' },
    { label: 'Hacienda Foral de Bizkaia — IRPF 2026 vs 2025', url: 'https://dfb.microsoftcrmportals.com/es-ES/Articulo/?Code=KA-01877' },
  ],
  Ireland: [
    { label: 'Revenue — tax credits, reliefs and rates', url: 'https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx' },
    { label: 'Revenue — USC rates and thresholds', url: 'https://www.revenue.ie/en/jobs-and-pensions/usc/standard-rates-thresholds.aspx' },
    { label: 'gov.ie — PRSI contribution rates (SW14, Jan 2026)', url: 'https://assets.gov.ie/static/documents/cb168977/PRSI_C20260116_Contribution_Rates_and_User_Guide_-_SW_14_-_English_Version_-_January_2026_.pdf-web.pdf' },
  ],
  'United Kingdom': [
    { label: 'GOV.UK — Rates and thresholds for employers 2026 to 2027', url: 'https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027' },
    { label: 'gov.scot — Scottish income tax 2026-27 factsheet', url: 'https://www.gov.scot/publications/scottish-income-tax-technical-factsheet/' },
  ],
  'United States': [
    { label: 'IRS — 2026 inflation adjustments (Rev. Proc. 2025-32, incl. OBBBA)', url: 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill' },
    { label: 'SSA — contribution and benefit base', url: 'https://www.ssa.gov/oact/cola/cbb.html' },
    { label: 'IRS — 401(k) limit 2026', url: 'https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500' },
    { label: 'CA EDD — 2026 withholding schedules (2025 indexed brackets)', url: 'https://edd.ca.gov/siteassets/files/pdf_pub_ctr/26methb.pdf' },
    { label: 'NY DTF — 2026 IT-2105-I (NYS & NYC rates, recapture)', url: 'https://www.tax.ny.gov/pdf/current_forms/it/it2105i.pdf' },
    { label: 'NY Paid Family Leave 2026', url: 'https://paidfamilyleave.ny.gov/2026' },
    { label: 'WA ESD — PFML 2026 premium', url: 'https://esd.wa.gov/about-us/news-release/2025/paid-family-medical-leave-premium-rate-increases-113-2026' },
    { label: 'NCDOR — tax rate schedules', url: 'https://www.ncdor.gov/taxes-forms/individual-income-tax/tax-rate-schedules' },
    { label: 'Mass.gov — 4% surtax', url: 'https://www.mass.gov/info-details/massachusetts-4-surtax-on-taxable-income' },
    { label: 'IDOR — Bulletin FY 2026-15', url: 'https://tax.illinois.gov/research/publications/bulletins/fy-2026-15.html' },
    { label: 'GA DOR — 2026 Employer’s Tax Guide (4.99%)', url: 'https://dor.georgia.gov/document/document/2026-employers-tax-guide-updated-june-2026/download' },
  ],
  Canada: [
    { label: 'CRA — 2026 tax rates and brackets', url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html' },
    { label: 'CRA — T4127 Payroll Deductions Formulas (Jul 2026)', url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jul/t4127-jul-payroll-deductions-formulas.html' },
    { label: 'CRA — EI premium rates and maximums', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rate-maximum.html' },
    { label: 'Finances Québec — 2026 tax parameters', url: 'https://cdn-contenu.quebec.ca/cdn-contenu/adm/min/finances/publications-adm/parametres/AUTFR_RegimeImpot2026.pdf' },
    { label: 'Retraite Québec — QPP contributions', url: 'https://www.retraitequebec.gouv.qc.ca/en/employeur/role_rrq/Pages/cotisations.aspx' },
  ],
}
