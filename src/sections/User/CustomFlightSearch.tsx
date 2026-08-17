import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { functions, appwriteConfig } from '../../appwrite/client';

const convertToIATA = (locationStr: string, defaultFallback = 'LOS'): string => {
  if (!locationStr) return defaultFallback;
  const normalized = locationStr.trim().toUpperCase();

  if (normalized.includes('LAGOS') || normalized.includes('LOS')) return 'LOS';
  if (normalized.includes('LONDON') || normalized.includes('LHR')) return 'LHR';
  if (normalized.includes('ABUJA') || normalized.includes('ABV')) return 'ABV';
  if (normalized.includes('NEW YORK') || normalized.includes('JFK')) return 'JFK';
  if (normalized.includes('PARIS') || normalized.includes('CDG')) return 'CDG';
  if (normalized.includes('DUBAI') || normalized.includes('DXB')) return 'DXB';
  if (normalized.includes('NAIROBI') || normalized.includes('NBO')) return 'NBO';
  if (normalized.includes('PORT HARCOURT') || normalized.includes('PHC')) return 'PHC';
  if (normalized.includes('SANTORINI') || normalized.includes('THIRA')) return 'JTR';
  if (normalized.includes('ACCRA') || normalized.includes('ACC')) return 'ACC';
  if (normalized.includes('JOHANNESBURG') || normalized.includes('JNB')) return 'JNB';
  if (normalized.includes('ATLANTA') || normalized.includes('ATL')) return 'ATL';
  if (normalized.includes('TORONTO') || normalized.includes('YYZ')) return 'YYZ';
  if (normalized.includes('HOUSTON') || normalized.includes('IAH')) return 'IAH';
  if (normalized.includes('AMSTERDAM') || normalized.includes('AMS')) return 'AMS';
  if (normalized.includes('FRANKFURT') || normalized.includes('FRA')) return 'FRA';
  if (normalized.includes('ISTANBUL') || normalized.includes('IST')) return 'IST';
  if (normalized.includes('DOHA') || normalized.includes('DOH')) return 'DOH';
  if (normalized.includes('CAIRO') || normalized.includes('CAI')) return 'CAI';
  if (normalized.includes('LONDON GATWICK') || normalized.includes('LGW')) return 'LGW';
  if (normalized.includes('LOS ANGELES') || normalized.includes('LAX')) return 'LAX';
  if (normalized.includes('CHICAGO') || normalized.includes('ORD')) return 'ORD';
  if (normalized.includes('MADRID') || normalized.includes('MAD')) return 'MAD';
  if (normalized.includes('ROME') || normalized.includes('FCO')) return 'FCO';
  if (normalized.includes('SINGAPORE') || normalized.includes('SIN')) return 'SIN';
  if (normalized.includes('TOKYO') || normalized.includes('TYO')) return 'NRT';
  if (normalized.includes('BANGKOK') || normalized.includes('BKK')) return 'BKK';
  if (normalized.includes('ZURICH') || normalized.includes('ZRH')) return 'ZRH';
  if (normalized.includes('BRUSSELS') || normalized.includes('BRU')) return 'BRU';
  // --- AFRICA ---
  if (normalized.includes('LAGOS') || normalized.includes('LOS')) return 'LOS';
  if (normalized.includes('ABUJA') || normalized.includes('ABV')) return 'ABV';
  if (normalized.includes('PORT HARCOURT') || normalized.includes('PHC')) return 'PHC';
  if (normalized.includes('KANO') || normalized.includes('KAN')) return 'KAN';
  if (normalized.includes('ENUGU') || normalized.includes('ENU')) return 'ENU';
  if (normalized.includes('ACCRA') || normalized.includes('ACC')) return 'ACC';
  if (normalized.includes('NAIROBI') || normalized.includes('NBO')) return 'NBO';
  if (normalized.includes('JOHANNESBURG') || normalized.includes('JNB')) return 'JNB';
  if (normalized.includes('CAPE TOWN') || normalized.includes('CPT')) return 'CPT';
  if (normalized.includes('CAIRO') || normalized.includes('CAI')) return 'CAI';
  if (normalized.includes('CASABLANCA') || normalized.includes('CMN')) return 'CMN';
  if (normalized.includes('ADDIS ABABA') || normalized.includes('ADD')) return 'ADD';
  if (normalized.includes('DAKAR') || normalized.includes('DSS')) return 'DSS';
  if (normalized.includes('KIGALI') || normalized.includes('KGL')) return 'KGL';
  if (normalized.includes('DAR ES SALAAM') || normalized.includes('DAR')) return 'DAR';
  if (normalized.includes('MAURITIUS') || normalized.includes('MRU')) return 'MRU';
  if (normalized.includes('ZANZIBAR') || normalized.includes('ZNZ')) return 'ZNZ';

  // --- EUROPE ---
  if (normalized.includes('LONDON') || normalized.includes('LHR')) return 'LHR';
  if (normalized.includes('LONDON GATWICK') || normalized.includes('LGW')) return 'LGW';
  if (normalized.includes('PARIS') || normalized.includes('CDG')) return 'CDG';
  if (normalized.includes('AMSTERDAM') || normalized.includes('AMS')) return 'AMS';
  if (normalized.includes('FRANKFURT') || normalized.includes('FRA')) return 'FRA';
  if (normalized.includes('ISTANBUL') || normalized.includes('IST')) return 'IST';
  if (normalized.includes('MADRID') || normalized.includes('MAD')) return 'MAD';
  if (normalized.includes('BARCELONA') || normalized.includes('BCN')) return 'BCN';
  if (normalized.includes('ROME') || normalized.includes('FCO')) return 'FCO';
  if (normalized.includes('MILAN') || normalized.includes('MXP')) return 'MXP';
  if (normalized.includes('ZURICH') || normalized.includes('ZRH')) return 'ZRH';
  if (normalized.includes('GENEVA') || normalized.includes('GVA')) return 'GVA';
  if (normalized.includes('BRUSSELS') || normalized.includes('BRU')) return 'BRU';
  if (normalized.includes('VIENNA') || normalized.includes('VIE')) return 'VIE';
  if (normalized.includes('MUNICH') || normalized.includes('MUC')) return 'MUC';
  if (normalized.includes('DUBLIN') || normalized.includes('DUB')) return 'DUB';
  if (normalized.includes('LISBON') || normalized.includes('LIS')) return 'LIS';
  if (normalized.includes('ATHENS') || normalized.includes('ATH')) return 'ATH';
  if (normalized.includes('SANTORINI') || normalized.includes('THIRA') || normalized.includes('JTR')) return 'JTR';
  if (normalized.includes('MYKONOS') || normalized.includes('JMK')) return 'JMK';
  if (normalized.includes('STOCKHOLM') || normalized.includes('ARN')) return 'ARN';
  if (normalized.includes('OSLO') || normalized.includes('OSL')) return 'OSL';
  if (normalized.includes('COPENHAGEN') || normalized.includes('CPH')) return 'CPH';
  if (normalized.includes('HELSINKI') || normalized.includes('HEL')) return 'HEL';
  if (normalized.includes('WARSAW') || normalized.includes('WAW')) return 'WAW';
  if (normalized.includes('PRAGUE') || normalized.includes('PRG')) return 'PRG';
  if (normalized.includes('BUDAPEST') || normalized.includes('BUD')) return 'BUD';

  // --- NORTH AMERICA ---
  if (normalized.includes('NEW YORK') || normalized.includes('NYC') || normalized.includes('JFK')) return 'JFK';
  if (normalized.includes('NEWARK') || normalized.includes('EWR')) return 'EWR';
  if (normalized.includes('LOS ANGELES') || normalized.includes('LAX')) return 'LAX';
  if (normalized.includes('CHICAGO') || normalized.includes('ORD')) return 'ORD';
  if (normalized.includes('ATLANTA') || normalized.includes('ATL')) return 'ATL';
  if (normalized.includes('MIAMI') || normalized.includes('MIA')) return 'MIA';
  if (normalized.includes('SAN FRANCISCO') || normalized.includes('SFO')) return 'SFO';
  if (normalized.includes('WASHINGTON') || normalized.includes('IAD')) return 'IAD';
  if (normalized.includes('BOSTON') || normalized.includes('BOS')) return 'BOS';
  if (normalized.includes('HOUSTON') || normalized.includes('IAH')) return 'IAH';
  if (normalized.includes('DALLAS') || normalized.includes('DFW')) return 'DFW';
  if (normalized.includes('SEATTLE') || normalized.includes('SEA')) return 'SEA';
  if (normalized.includes('LAS VEGAS') || normalized.includes('LAS')) return 'LAS';
  if (normalized.includes('ORLANDO') || normalized.includes('MCO')) return 'MCO';
  if (normalized.includes('TORONTO') || normalized.includes('YYZ')) return 'YYZ';
  if (normalized.includes('VANCOUVER') || normalized.includes('YVR')) return 'YVR';
  if (normalized.includes('MONTREAL') || normalized.includes('YUL')) return 'YUL';
  if (normalized.includes('MEXICO CITY') || normalized.includes('MEX')) return 'MEX';
  if (normalized.includes('CANCUN') || normalized.includes('CUN')) return 'CUN';

  // --- MIDDLE EAST & ASIA ---
  if (normalized.includes('DUBAI') || normalized.includes('DXB')) return 'DXB';
  if (normalized.includes('DOHA') || normalized.includes('DOH')) return 'DOH';
  if (normalized.includes('ABU DHABI') || normalized.includes('AUH')) return 'AUH';
  if (normalized.includes('RIYADH') || normalized.includes('RUH')) return 'RUH';
  if (normalized.includes('JEDDAH') || normalized.includes('JED')) return 'JED';
  if (normalized.includes('TEL AVIV') || normalized.includes('TLV')) return 'TLV';
  if (normalized.includes('BEIRUT') || normalized.includes('BEY')) return 'BEY';
  if (normalized.includes('TOKYO') || normalized.includes('NRT')) return 'NRT';
  if (normalized.includes('SINGAPORE') || normalized.includes('SIN')) return 'SIN';
  if (normalized.includes('HONG KONG') || normalized.includes('HKG')) return 'HKG';
  if (normalized.includes('BANGKOK') || normalized.includes('BKK')) return 'BKK';
  if (normalized.includes('KUALA LUMPUR') || normalized.includes('KUL')) return 'KUL';
  if (normalized.includes('SEOUL') || normalized.includes('ICN')) return 'ICN';
  if (normalized.includes('BEIJING') || normalized.includes('PEK')) return 'PEK';
  if (normalized.includes('SHANGHAI') || normalized.includes('PVG')) return 'PVG';
  if (normalized.includes('MUMBAI') || normalized.includes('BOM')) return 'BOM';
  if (normalized.includes('NEW DELHI') || normalized.includes('DEL')) return 'DEL';
  if (normalized.includes('MANILA') || normalized.includes('MNL')) return 'MNL';
  if (normalized.includes('JAKARTA') || normalized.includes('CGK')) return 'CGK';
  if (normalized.includes('BALI') || normalized.includes('DPS')) return 'DPS';

  // --- SOUTH AMERICA & OCEANIA ---
  if (normalized.includes('SÃO PAULO') || normalized.includes('SAO PAULO') || normalized.includes('GRU')) return 'GRU';
  if (normalized.includes('RIO DE JANEIRO') || normalized.includes('GIG')) return 'GIG';
  if (normalized.includes('BUENOS AIRES') || normalized.includes('EZE')) return 'EZE';
  if (normalized.includes('BOGOTA') || normalized.includes('BOG')) return 'BOG';
  if (normalized.includes('SANTIAGO') || normalized.includes('SCL')) return 'SCL';
  if (normalized.includes('LIMA') || normalized.includes('LIM')) return 'LIM';
  if (normalized.includes('SYDNEY') || normalized.includes('SYD')) return 'SYD';
  if (normalized.includes('MELBOURNE') || normalized.includes('MEL')) return 'MEL';
  if (normalized.includes('AUCKLAND') || normalized.includes('AKL')) return 'AKL';
  if (normalized.includes('BRISBANE') || normalized.includes('BNE')) return 'BNE';

  // ==========================================
  // --- AFRICA (ALL SOVEREIGN NATIONS) ---
  // ==========================================
  if (normalized.includes('ALGERIA') || normalized.includes('ALGIERS') || normalized.includes('ALG')) return 'ALG';
  if (normalized.includes('ANGOLA') || normalized.includes('LUANDA') || normalized.includes('LAD')) return 'LAD';
  if (normalized.includes('BENIN') || normalized.includes('COTONOU') || normalized.includes('COO')) return 'COO';
  if (normalized.includes('BOTSWANA') || normalized.includes('GABORONE') || normalized.includes('GBE')) return 'GBE';
  if (normalized.includes('BURKINA FASO') || normalized.includes('OUAGADOUGOU') || normalized.includes('OUA')) return 'OUA';
  if (normalized.includes('BURUNDI') || normalized.includes('BUJUMBURA') || normalized.includes('BJM')) return 'BJM';
  if (normalized.includes('CABO VERDE') || normalized.includes('CAPE VERDE') || normalized.includes('PRAIA') || normalized.includes('SID')) return 'SID';
  if (normalized.includes('CAMEROON') || normalized.includes('YAOUNDE') || normalized.includes('DOUALA') || normalized.includes('DLA')) return 'DLA';
  if (normalized.includes('CENTRAL AFRICAN REPUBLIC') || normalized.includes('BANGUI') || normalized.includes('BGF')) return 'BGF';
  if (normalized.includes('CHAD') || normalized.includes('NDJAMENA') || normalized.includes('NDJ')) return 'NDJ';
  if (normalized.includes('COMOROS') || normalized.includes('MORONI') || normalized.includes('HAH')) return 'HAH';
  if (normalized.includes('CONGO') || normalized.includes('BRAZZAVILLE') || normalized.includes('BZV')) return 'BZV';
  if (normalized.includes('DEMOCRATIC REPUBLIC OF THE CONGO') || normalized.includes('DR CONGO') || normalized.includes('KINSHASA') || normalized.includes('FIH')) return 'FIH';
  if (normalized.includes('DJIBOUTI') || normalized.includes('JIB')) return 'JIB';
  if (normalized.includes('EGYPT') || normalized.includes('CAIRO') || normalized.includes('CAI')) return 'CAI';
  if (normalized.includes('EQUATORIAL GUINEA') || normalized.includes('MALABO') || normalized.includes('SSG')) return 'SSG';
  if (normalized.includes('ERITREA') || normalized.includes('ASMARA') || normalized.includes('ASM')) return 'ASM';
  if (normalized.includes('ESWATINI') || normalized.includes('SWAZILAND') || normalized.includes('MBABANE') || normalized.includes('SHO')) return 'SHO';
  if (normalized.includes('ETHIOPIA') || normalized.includes('ADDIS ABABA') || normalized.includes('ADD')) return 'ADD';
  if (normalized.includes('GABON') || normalized.includes('LIBREVILLE') || normalized.includes('LBV')) return 'LBV';
  if (normalized.includes('GAMBIA') || normalized.includes('BANJUL') || normalized.includes('BJL')) return 'BJL';
  if (normalized.includes('GHANA') || normalized.includes('ACCRA') || normalized.includes('ACC')) return 'ACC';
  if (normalized.includes('GUINEA') || normalized.includes('CONAKRY') || normalized.includes('CKY')) return 'CKY';
  if (normalized.includes('GUINEA-BISSAU') || normalized.includes('BISSAU') || normalized.includes('OXB')) return 'OXB';
  if (normalized.includes('IVORY COAST') || normalized.includes('COTE D IVOIRE') || normalized.includes('ABIDJAN') || normalized.includes('ABJ')) return 'ABJ';
  if (normalized.includes('KENYA') || normalized.includes('NAIROBI') || normalized.includes('NBO')) return 'NBO';
  if (normalized.includes('LESOTHO') || normalized.includes('MASERU') || normalized.includes('MSU')) return 'MSU';
  if (normalized.includes('LIBERIA') || normalized.includes('MONROVIA') || normalized.includes('ROB')) return 'ROB';
  if (normalized.includes('LIBYA') || normalized.includes('TRIPOLI') || normalized.includes('TIP')) return 'TIP';
  if (normalized.includes('MADAGASCAR') || normalized.includes('ANTANANARIVO') || normalized.includes('TNR')) return 'TNR';
  if (normalized.includes('MALAWI') || normalized.includes('LILONGWE') || normalized.includes('LLW')) return 'LLW';
  if (normalized.includes('MALI') || normalized.includes('BAMAKO') || normalized.includes('BKO')) return 'BKO';
  if (normalized.includes('MAURITANIA') || normalized.includes('NOUAKCHOTT') || normalized.includes('NKC')) return 'NKC';
  if (normalized.includes('MAURITIUS') || normalized.includes('PORT LOUIS') || normalized.includes('MRU')) return 'MRU';
  if (normalized.includes('MOROCCO') || normalized.includes('CASABLANCA') || normalized.includes('RABAT') || normalized.includes('CMN')) return 'CMN';
  if (normalized.includes('MOZAMBIQUE') || normalized.includes('MAPUTO') || normalized.includes('MPM')) return 'MPM';
  if (normalized.includes('NAMIBIA') || normalized.includes('WINDHOEK') || normalized.includes('WDH')) return 'WDH';
  if (normalized.includes('NIGER') || normalized.includes('NIAMEY') || normalized.includes('NIM')) return 'NIM';
  if (normalized.includes('NIGERIA') || normalized.includes('LAGOS') || normalized.includes('ABUJA') || normalized.includes('PORT HARCOURT') || normalized.includes('LOS') || normalized.includes('ABV') || normalized.includes('PHC')) return 'LOS';
  if (normalized.includes('RWANDA') || normalized.includes('KIGALI') || normalized.includes('KGL')) return 'KGL';
  if (normalized.includes('SAO TOME AND PRINCIPE') || normalized.includes('SAO TOME') || normalized.includes('TMS')) return 'TMS';
  if (normalized.includes('SENEGAL') || normalized.includes('DAKAR') || normalized.includes('DSS')) return 'DSS';
  if (normalized.includes('SEYCHELLES') || normalized.includes('VICTORIA') || normalized.includes('SEZ')) return 'SEZ';
  if (normalized.includes('SIERRA LEONE') || normalized.includes('FREETOWN') || normalized.includes('FNA')) return 'FNA';
  if (normalized.includes('SOMALIA') || normalized.includes('MOGADISHU') || normalized.includes('MGQ')) return 'MGQ';
  if (normalized.includes('SOUTH AFRICA') || normalized.includes('JOHANNESBURG') || normalized.includes('CAPE TOWN') || normalized.includes('JNB')) return 'JNB';
  if (normalized.includes('SOUTH SUDAN') || normalized.includes('JUBA') || normalized.includes('JUB')) return 'JUB';
  if (normalized.includes('SUDAN') || normalized.includes('KHARTOUM') || normalized.includes('KRT')) return 'KRT';
  if (normalized.includes('TANZANIA') || normalized.includes('DAR ES SALAAM') || normalized.includes('ZANZIBAR') || normalized.includes('DAR')) return 'DAR';
  if (normalized.includes('TOGO') || normalized.includes('LOME') || normalized.includes('LFW')) return 'LFW';
  if (normalized.includes('TUNISIA') || normalized.includes('TUNIS') || normalized.includes('TUN')) return 'TUN';
  if (normalized.includes('UGANDA') || normalized.includes('KAMPALA') || normalized.includes('ENTEBBE') || normalized.includes('EBB')) return 'EBB';
  if (normalized.includes('ZAMBIA') || normalized.includes('LUSAKA') || normalized.includes('LUN')) return 'LUN';
  if (normalized.includes('ZIMBABWE') || normalized.includes('HARARE') || normalized.includes('HRE')) return 'HRE';

  // ==========================================
  // --- EUROPE (ALL SOVEREIGN NATIONS) ---
  // ==========================================
  if (normalized.includes('ALBANIA') || normalized.includes('TIRANA') || normalized.includes('TIA')) return 'TIA';
  if (normalized.includes('ANDORRA') || normalized.includes('ALV')) return 'ALV';
  if (normalized.includes('AUSTRIA') || normalized.includes('VIENNA') || normalized.includes('VIE')) return 'VIE';
  if (normalized.includes('BELARUS') || normalized.includes('MINSK') || normalized.includes('MSQ')) return 'MSQ';
  if (normalized.includes('BELGIUM') || normalized.includes('BRUSSELS') || normalized.includes('BRU')) return 'BRU';
  if (normalized.includes('BOSNIA') || normalized.includes('SARAJEVO') || normalized.includes('SJJ')) return 'SJJ';
  if (normalized.includes('BULGARIA') || normalized.includes('SOFIA') || normalized.includes('SOF')) return 'SOF';
  if (normalized.includes('CROATIA') || normalized.includes('ZAGREB') || normalized.includes('ZAG')) return 'ZAG';
  if (normalized.includes('CYPRUS') || normalized.includes('NICOSIA') || normalized.includes('LARNACA') || normalized.includes('LCA')) return 'LCA';
  if (normalized.includes('CZECHIA') || normalized.includes('CZECH REPUBLIC') || normalized.includes('PRAGUE') || normalized.includes('PRG')) return 'PRG';
  if (normalized.includes('DENMARK') || normalized.includes('COPENHAGEN') || normalized.includes('CPH')) return 'CPH';
  if (normalized.includes('ESTONIA') || normalized.includes('TALLINN') || normalized.includes('TLL')) return 'TLL';
  if (normalized.includes('FINLAND') || normalized.includes('HELSINKI') || normalized.includes('HEL')) return 'HEL';
  if (normalized.includes('FRANCE') || normalized.includes('PARIS') || normalized.includes('CDG') || normalized.includes('ORY')) return 'CDG';
  if (normalized.includes('GEORGIA') || normalized.includes('TBILISI') || normalized.includes('TBS')) return 'TBS';
  if (normalized.includes('GERMANY') || normalized.includes('BERLIN') || normalized.includes('FRANKFURT') || normalized.includes('MUNICH') || normalized.includes('FRA') || normalized.includes('MUC') || normalized.includes('BER')) return 'FRA';
  if (normalized.includes('GREECE') || normalized.includes('ATHENS') || normalized.includes('ATH')) return 'ATH';
  if (normalized.includes('HUNGARY') || normalized.includes('BUDAPEST') || normalized.includes('BUD')) return 'BUD';
  if (normalized.includes('ICELAND') || normalized.includes('REYKJAVIK') || normalized.includes('KEF')) return 'KEF';
  if (normalized.includes('IRELAND') || normalized.includes('DUBLIN') || normalized.includes('DUB')) return 'DUB';
  if (normalized.includes('ITALY') || normalized.includes('ROME') || normalized.includes('MILAN') || normalized.includes('FCO') || normalized.includes('MXP')) return 'FCO';
  if (normalized.includes('KOSOVO') || normalized.includes('PRISTINA') || normalized.includes('PRN')) return 'PRN';
  if (normalized.includes('LATVIA') || normalized.includes('RIGA') || normalized.includes('RIX')) return 'RIX';
  if (normalized.includes('LIECHTENSTEIN') || normalized.includes('VADUZ')) return 'ZRH';
  if (normalized.includes('LITHUANIA') || normalized.includes('VILNIUS') || normalized.includes('VNO')) return 'VNO';
  if (normalized.includes('LUXEMBOURG') || normalized.includes('LUX')) return 'LUX';
  if (normalized.includes('MALTA') || normalized.includes('VALLETTA') || normalized.includes('MLA')) return 'MLA';
  if (normalized.includes('MOLDOVA') || normalized.includes('CHISINAU') || normalized.includes('KIV')) return 'KIV';
  if (normalized.includes('MONACO') || normalized.includes('MCM')) return 'MCM';
  if (normalized.includes('MONTENEGRO') || normalized.includes('PODGORICA') || normalized.includes('TGD')) return 'TGD';
  if (normalized.includes('NETHERLANDS') || normalized.includes('AMSTERDAM') || normalized.includes('AMS')) return 'AMS';
  if (normalized.includes('NORTH MACEDONIA') || normalized.includes('MACEDONIA') || normalized.includes('SKOPJE') || normalized.includes('SKP')) return 'SKP';
  if (normalized.includes('NORWAY') || normalized.includes('OSLO') || normalized.includes('OSL')) return 'OSL';
  if (normalized.includes('POLAND') || normalized.includes('WARSAW') || normalized.includes('WAW')) return 'WAW';
  if (normalized.includes('PORTUGAL') || normalized.includes('LISBON') || normalized.includes('PORTO') || normalized.includes('LIS')) return 'LIS';
  if (normalized.includes('ROMANIA') || normalized.includes('BUCHAREST') || normalized.includes('OTP')) return 'OTP';
  if (normalized.includes('RUSSIA') || normalized.includes('MOSCOW') || normalized.includes('ST PETERSBURG') || normalized.includes('SVO') || normalized.includes('LED')) return 'SVO';
  if (normalized.includes('SAN MARINO')) return 'RMI';
  if (normalized.includes('SERBIA') || normalized.includes('BELGRADE') || normalized.includes('BEG')) return 'BEG';
  if (normalized.includes('SLOVAKIA') || normalized.includes('BRATISLAVA') || normalized.includes('BTS')) return 'BTS';
  if (normalized.includes('SLOVENIA') || normalized.includes('LJUBLJANA') || normalized.includes('LJU')) return 'LJU';
  if (normalized.includes('SPAIN') || normalized.includes('MADRID') || normalized.includes('BARCELONA') || normalized.includes('MAD') || normalized.includes('BCN')) return 'MAD';
  if (normalized.includes('SWEDEN') || normalized.includes('STOCKHOLM') || normalized.includes('ARN')) return 'ARN';
  if (normalized.includes('SWITZERLAND') || normalized.includes('ZURICH') || normalized.includes('GENEVA') || normalized.includes('ZRH') || normalized.includes('GVA')) return 'ZRH';
  if (normalized.includes('UKRAINE') || normalized.includes('KYIV') || normalized.includes('KBP')) return 'KBP';
  if (normalized.includes('UNITED KINGDOM') || normalized.includes('UK') || normalized.includes('LONDON') || normalized.includes('LHR') || normalized.includes('LGW')) return 'LHR';
  if (normalized.includes('VATICAN') || normalized.includes('VATICAN CITY')) return 'FCO';

  // ==========================================
  // --- NORTH AMERICA & CARIBBEAN ---
  // ==========================================
  if (normalized.includes('ANTIGUA AND BARBUDA') || normalized.includes('ANU')) return 'ANU';
  if (normalized.includes('BAHAMAS') || normalized.includes('NASSAU') || normalized.includes('NAS')) return 'NAS';
  if (normalized.includes('BARBADOS') || normalized.includes('BRIDGETOWN') || normalized.includes('BGI')) return 'BGI';
  if (normalized.includes('BELIZE') || normalized.includes('BZE')) return 'BZE';
  if (normalized.includes('CANADA') || normalized.includes('TORONTO') || normalized.includes('VANCOUVER') || normalized.includes('MONTREAL') || normalized.includes('YYZ') || normalized.includes('YVR') || normalized.includes('YUL')) return 'YYZ';
  if (normalized.includes('COSTA RICA') || normalized.includes('SAN JOSE') || normalized.includes('SJO')) return 'SJO';
  if (normalized.includes('CUBA') || normalized.includes('HAVANA') || normalized.includes('HAV')) return 'HAV';
  if (normalized.includes('DOMINICA')) return 'DOM';
  if (normalized.includes('DOMINICAN REPUBLIC') || normalized.includes('SANTO DOMINGO') || normalized.includes('PUNTA CANA') || normalized.includes('SDQ') || normalized.includes('PUJ')) return 'SDQ';
  if (normalized.includes('EL SALVADOR') || normalized.includes('SAL')) return 'SAL';
  if (normalized.includes('GRENADA') || normalized.includes('GND')) return 'GND';
  if (normalized.includes('GUATEMALA') || normalized.includes('GUA')) return 'GUA';
  if (normalized.includes('HAITI') || normalized.includes('PAP')) return 'PAP';
  if (normalized.includes('HONDURAS') || normalized.includes('TGU')) return 'TGU';
  if (normalized.includes('JAMAICA') || normalized.includes('KINGSTON') || normalized.includes('MONTEGO BAY') || normalized.includes('KIN') || normalized.includes('MBJ')) return 'KIN';
  if (normalized.includes('MEXICO') || normalized.includes('MEXICO CITY') || normalized.includes('CANCUN') || normalized.includes('MEX') || normalized.includes('CUN')) return 'MEX';
  if (normalized.includes('NICARAGUA') || normalized.includes('MGA')) return 'MGA';
  if (normalized.includes('PANAMA') || normalized.includes('PTY')) return 'PTY';
  if (normalized.includes('SAINT KITTS AND NEVIS') || normalized.includes('SKB')) return 'SKB';
  if (normalized.includes('SAINT LUCIA') || normalized.includes('UVF')) return 'UVF';
  if (normalized.includes('SAINT VINCENT') || normalized.includes('SVD')) return 'SVD';
  if (normalized.includes('TRINIDAD AND TOBAGO') || normalized.includes('POS')) return 'POS';
  if (normalized.includes('UNITED STATES') || normalized.includes('USA') || normalized.includes('NEW YORK') || normalized.includes('LOS ANGELES') || normalized.includes('CHICAGO') || normalized.includes('ATLANTA') || normalized.includes('MIAMI') || normalized.includes('JFK') || normalized.includes('LAX') || normalized.includes('ORD') || normalized.includes('ATL') || normalized.includes('MIA')) return 'JFK';

  // ==========================================
  // --- SOUTH AMERICA ---
  // ==========================================
  if (normalized.includes('ARGENTINA') || normalized.includes('BUENOS AIRES') || normalized.includes('EZE')) return 'EZE';
  if (normalized.includes('BOLIVIA') || normalized.includes('LA PAZ') || normalized.includes('VVI')) return 'VVI';
  if (normalized.includes('BRAZIL') || normalized.includes('SAO PAULO') || normalized.includes('RIO DE JANEIRO') || normalized.includes('GRU') || normalized.includes('GIG')) return 'GRU';
  if (normalized.includes('CHILE') || normalized.includes('SANTIAGO') || normalized.includes('SCL')) return 'SCL';
  if (normalized.includes('COLOMBIA') || normalized.includes('BOGOTA') || normalized.includes('BOG')) return 'BOG';
  if (normalized.includes('ECUADOR') || normalized.includes('QUITO') || normalized.includes('UIO')) return 'UIO';
  if (normalized.includes('GUYANA') || normalized.includes('GEO')) return 'GEO';
  if (normalized.includes('PARAGUAY') || normalized.includes('ASUNCION') || normalized.includes('ASU')) return 'ASU';
  if (normalized.includes('PERU') || normalized.includes('LIMA') || normalized.includes('LIM')) return 'LIM';
  if (normalized.includes('SURINAME') || normalized.includes('PBM')) return 'PBM';
  if (normalized.includes('URUGUAY') || normalized.includes('MONTEVIDEO') || normalized.includes('MVD')) return 'MVD';
  if (normalized.includes('VENEZUELA') || normalized.includes('CARACAS') || normalized.includes('CCS')) return 'CCS';

  // ==========================================
  // --- ASIA & MIDDLE EAST ---
  // ==========================================
  if (normalized.includes('AFGHANISTAN') || normalized.includes('KBL')) return 'KBL';
  if (normalized.includes('ARMENIA') || normalized.includes('EVN')) return 'EVN';
  if (normalized.includes('AZERBAIJAN') || normalized.includes('GYD')) return 'GYD';
  if (normalized.includes('BAHRAIN') || normalized.includes('BAH')) return 'BAH';
  if (normalized.includes('BANGLADESH') || normalized.includes('DAC')) return 'DAC';
  if (normalized.includes('BHUTAN') || normalized.includes('PBH')) return 'PBH';
  if (normalized.includes('BRUNEI') || normalized.includes('BWN')) return 'BWN';
  if (normalized.includes('CAMBODIA') || normalized.includes('PNH')) return 'PNH';
  if (normalized.includes('CHINA') || normalized.includes('BEIJING') || normalized.includes('SHANGHAI') || normalized.includes('GUANGZHOU') || normalized.includes('PEK') || normalized.includes('PVG') || normalized.includes('CAN')) return 'PEK';
  if (normalized.includes('INDIA') || normalized.includes('NEW DELHI') || normalized.includes('MUMBAI') || normalized.includes('BANGALORE') || normalized.includes('DEL') || normalized.includes('BOM') || normalized.includes('BLR')) return 'DEL';
  if (normalized.includes('INDONESIA') || normalized.includes('JAKARTA') || normalized.includes('BALI') || normalized.includes('CGK') || normalized.includes('DPS')) return 'CGK';
  if (normalized.includes('IRAN') || normalized.includes('TEHRAN') || normalized.includes('IKA')) return 'IKA';
  if (normalized.includes('IRAQ') || normalized.includes('BGW')) return 'BGW';
  if (normalized.includes('ISRAEL') || normalized.includes('TEL AVIV') || normalized.includes('TLV')) return 'TLV';
  if (normalized.includes('JAPAN') || normalized.includes('TOKYO') || normalized.includes('OSAKA') || normalized.includes('NRT') || normalized.includes('HND')) return 'NRT';
  if (normalized.includes('JORDAN') || normalized.includes('AMMAN') || normalized.includes('AMM')) return 'AMM';
  if (normalized.includes('KAZAKHSTAN') || normalized.includes('ASTANA') || normalized.includes('NQZ')) return 'NQZ';
  if (normalized.includes('KUWAIT') || normalized.includes('KWI')) return 'KWI';
  if (normalized.includes('KYRGYZSTAN') || normalized.includes('FRU')) return 'FRU';
  if (normalized.includes('LAOS') || normalized.includes('VTE')) return 'VTE';
  if (normalized.includes('LEBANON') || normalized.includes('BEIRUT') || normalized.includes('BEY')) return 'BEY';
  if (normalized.includes('MALAYSIA') || normalized.includes('KUALA LUMPUR') || normalized.includes('KUL')) return 'KUL';
  if (normalized.includes('MALDIVES') || normalized.includes('MLE')) return 'MLE';
  if (normalized.includes('MONGOLIA') || normalized.includes('ULN')) return 'ULN';
  if (normalized.includes('MYANMAR') || normalized.includes('RGN')) return 'RGN';
  if (normalized.includes('NEPAL') || normalized.includes('KATHMANDU') || normalized.includes('KTM')) return 'KTM';
  if (normalized.includes('NORTH KOREA') || normalized.includes('FNJ')) return 'FNJ';
  if (normalized.includes('OMAN') || normalized.includes('MUSCAT') || normalized.includes('MCT')) return 'MCT';
  if (normalized.includes('PAKISTAN') || normalized.includes('ISLAMABAD') || normalized.includes('KARACHI') || normalized.includes('ISB') || normalized.includes('KHI')) return 'ISB';
  if (normalized.includes('PALESTINE') || normalized.includes('GZA')) return 'GZA';
  if (normalized.includes('PHILIPPINES') || normalized.includes('MANILA') || normalized.includes('MNL')) return 'MNL';
  if (normalized.includes('QATAR') || normalized.includes('DOHA') || normalized.includes('DOH')) return 'DOH';
  if (normalized.includes('SAUDI ARABIA') || normalized.includes('RIYADH') || normalized.includes('JEDDAH') || normalized.includes('RUH') || normalized.includes('JED')) return 'RUH';
  if (normalized.includes('SINGAPORE') || normalized.includes('SIN')) return 'SIN';
  if (normalized.includes('SOUTH KOREA') || normalized.includes('SEOUL') || normalized.includes('ICN')) return 'ICN';
  if (normalized.includes('SRI LANKA') || normalized.includes('COLOMBO') || normalized.includes('CMB')) return 'CMB';
  if (normalized.includes('SYRIA') || normalized.includes('DAM')) return 'DAM';
  if (normalized.includes('TAIWAN') || normalized.includes('TAIPEI') || normalized.includes('TPE')) return 'TPE';
  if (normalized.includes('TAJIKISTAN') || normalized.includes('DYU')) return 'DYU';
  if (normalized.includes('THAILAND') || normalized.includes('BANGKOK') || normalized.includes('BKK')) return 'BKK';
  if (normalized.includes('TIMOR-LESTE') || normalized.includes('DIL')) return 'DIL';
  if (normalized.includes('TURKEY') || normalized.includes('TURKIYE') || normalized.includes('ISTANBUL') || normalized.includes('ANKARA') || normalized.includes('IST') || normalized.includes('ESB')) return 'IST';
  if (normalized.includes('TURKMENISTAN') || normalized.includes('ASB')) return 'ASB';
  if (normalized.includes('UNITED ARAB EMIRATES') || normalized.includes('UAE') || normalized.includes('DUBAI') || normalized.includes('ABU DHABI') || normalized.includes('DXB') || normalized.includes('AUH')) return 'DXB';
  if (normalized.includes('UZBEKISTAN') || normalized.includes('TAS')) return 'TAS';
  if (normalized.includes('VIETNAM') || normalized.includes('HO CHI MINH') || normalized.includes('HANOI') || normalized.includes('SGN') || normalized.includes('HAN')) return 'SGN';
  if (normalized.includes('YEMEN') || normalized.includes('SAH')) return 'SAH';

  // ==========================================
  // --- OCEANIA ---
  // ==========================================
  if (normalized.includes('AUSTRALIA') || normalized.includes('SYDNEY') || normalized.includes('MELBOURNE') || normalized.includes('BRISBANE') || normalized.includes('PERTH') || normalized.includes('SYD') || normalized.includes('MEL') || normalized.includes('BNE') || normalized.includes('PER')) return 'SYD';
  if (normalized.includes('FIJI') || normalized.includes('NAN')) return 'NAN';
  if (normalized.includes('KIRIBATI') || normalized.includes('TRW')) return 'TRW';
  if (normalized.includes('MARSHALL ISLANDS') || normalized.includes('MAJ')) return 'MAJ';
  if (normalized.includes('MICRONESIA') || normalized.includes('PNI')) return 'PNI';
  if (normalized.includes('NAURU') || normalized.includes('INU')) return 'INU';
  if (normalized.includes('NEW ZEALAND') || normalized.includes('AUCKLAND') || normalized.includes('WELLINGTON') || normalized.includes('AKL') || normalized.includes('WLG')) return 'AKL';
  if (normalized.includes('PALAU') || normalized.includes('ROR')) return 'ROR';
  if (normalized.includes('PAPUA NEW GUINEA') || normalized.includes('POM')) return 'POM';
  if (normalized.includes('SAMOA') || normalized.includes('APW')) return 'APW';
  if (normalized.includes('SOLOMON ISLANDS') || normalized.includes('HIR')) return 'HIR';
  if (normalized.includes('TONGA') || normalized.includes('TBU')) return 'TBU';
  if (normalized.includes('TUVALU') || normalized.includes('FUN')) return 'FUN';
  if (normalized.includes('VANUATU') || normalized.includes('VLI')) return 'VLI';

  // ==========================================
  // --- EXTRA HUBS & RESORTS ---
  // ==========================================
  if (normalized.includes('SANTORINI') || normalized.includes('THIRA')) return 'JTR';
  if (normalized.includes('MYKONOS')) return 'JMK';
  if (normalized.includes('IBIZA')) return 'IBZ';
  if (normalized.includes('BALI')) return 'DPS';
  if (normalized.includes('ZANZIBAR')) return 'ZNZ';



  if (/^[A-Z]{3}$/.test(normalized)) return normalized;

  const bracketMatch = normalized.match(/\(([A-Z]{3})\)/);
  if (bracketMatch) return bracketMatch[1];

  return defaultFallback;
};

const formatTime = (isoString?: string): string => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return isoString.split('T')[1]?.substring(0, 5) || '--:--';
  }
};

export const CustomFlightSearch: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const [flights, setFlights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [departureDate, setDepartureDate] = useState<string>(
    state.departureDate || getTomorrowDateString()
  );

  const [origin, setOrigin] = useState<string>(
    convertToIATA(state.origin || 'LOS', 'LOS')
  );
  const [destination, setDestination] = useState<string>(
    convertToIATA(
      state.destination || 
      state.preloadedTrip?.location?.city || 
      state.preloadedTrip?.destination || 
      'LHR', 
      'LHR'
    )
  );
  
  const travelClass = state.travelClass || 'economy';

  const fetchLiveFlights = async (date: string, originCode: string, destCode: string) => {
    setIsLoading(true);
    try {
      const sanitizedOrigin = convertToIATA(originCode, 'LOS');
      const sanitizedDestination = convertToIATA(destCode, 'LHR');

      const execution = await functions.createExecution(
        appwriteConfig.functionId,
        JSON.stringify({
          origin: sanitizedOrigin,
          destination: sanitizedDestination,
          departureDate: date,
          travelClass,
        })
      );
      const res = JSON.parse(execution.responseBody);
      if (res.success && res.offers) {
        setFlights(res.offers);
      } else {
        console.warn('Duffel API returned no offers:', res.error || 'Empty offer matrix');
        setFlights([]);
      }
    } catch (err) {
      console.error('Failed to fetch Duffel flights:', err);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFlights(departureDate, origin, destination);
  }, [departureDate, origin, destination]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLiveFlights(departureDate, origin, destination);
  };

  const handleSelectAndProceed = (offer: any) => {
    setSelectedOffer(offer);

    const slice = offer.slices?.[0] || {};
    const segment = slice.segments?.[0] || {};
    const depTime = segment.departing_at || `${departureDate}T12:00:00`;
    const flightNum = segment.flight_number || 'NX-404';
    const depAirport = slice.origin?.iata_code || origin;
    const arrAirport = slice.destination?.iata_code || destination;

    const offerPrice = offer.totalPriceToPay || 0;
    const baseTicket = offer.baseTicketCost ?? offerPrice * 0.9;
    const platFee = offer.platformFee ?? offerPrice * 0.1;

    navigate(`/Home/book/${id}`, {
      state: {
        ...state,
        origin,
        destination,
        liveFlight: offer,
        flightCost: baseTicket,
        platformFee: platFee,
        totalPrice: offerPrice,
        flightDetails: {
          departureTime: depTime,
          departureAirport: depAirport,
          arrivalAirport: arrAirport,
          flightNumber: flightNum,
          carrier: offer.airlineName,
          seatClass: travelClass,
        },
      },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 min-h-screen font-sans bg-slate-50/60">
      {/* Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <span>Step 2 of 3</span>
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span>Live Aviation Matrix</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Select Flight Protocol</h2>
          <p className="text-xs text-slate-500 mt-0.5">Available routes via Duffel API for <span className="font-mono font-bold text-slate-700">{origin}</span> → <span className="font-mono font-bold text-slate-700">{destination}</span></p>
        </div>

        {/* Search Parameter Adjuster Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-2.5 border border-slate-200 rounded-2xl">
          <div>
            <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block px-1 mb-1">Origin</label>
            <input 
              type="text" 
              maxLength={3}
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              className="w-16 text-xs font-mono font-bold px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-center uppercase focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <div>
            <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block px-1 mb-1">Destination</label>
            <input 
              type="text" 
              maxLength={3}
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              className="w-16 text-xs font-mono font-bold px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-center uppercase focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <div>
            <label className="text-[9px] font-mono font-bold text-slate-400 uppercase block px-1 mb-1">Departure Date</label>
            <input 
              type="date" 
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <button 
            type="submit"
            className="self-end px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Update
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-600">Querying Global Airline Matrix...</p>
        </div>
      ) : flights.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3 px-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 text-lg font-mono font-bold">Ø</div>
          <h3 className="text-sm font-bold text-slate-900">No Flights Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">No available routes for <span className="font-mono font-bold">{origin} → {destination}</span> on {departureDate}. Try tweaking your airport codes or changing the date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flights.map((offer) => {
            const isSelected = selectedOffer?.offerId === offer.offerId;
            
            const slice = offer.slices?.[0] || {};
            const segments = slice.segments || [];
            const firstSegment = segments[0] || {};
            const lastSegment = segments[segments.length - 1] || {};
            
            const depTimeFormatted = formatTime(firstSegment.departing_at);
            const arrTimeFormatted = formatTime(lastSegment.arriving_at);
            const stopsCount = segments.length - 1;

            return (
              <div 
                key={offer.offerId}
                className={`p-6 rounded-3xl border transition-all bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isSelected 
                    ? 'border-slate-900 ring-4 ring-slate-900/5 shadow-md bg-slate-900/[0.01]' 
                    : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                      {offer.airlineName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">ID: {offer.offerId}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 tracking-tight">{origin}</h4>
                      <span className="text-slate-400 font-mono text-xs">→</span>
                      <h4 className="text-base font-black text-slate-900 tracking-tight">{destination}</h4>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/70 rounded-xl text-xs font-mono">
                      <span className="font-bold text-slate-900">{depTimeFormatted}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-bold text-slate-900">{arrTimeFormatted}</span>
                    </div>

                    <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg border ${
                      stopsCount === 0 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                        : 'bg-amber-50 text-amber-700 border-amber-200/60'
                    }`}>
                      {stopsCount === 0 ? 'Direct Flight' : `${stopsCount} Stop(s)`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-xl font-black font-mono text-slate-900 tracking-tight">${offer.totalPriceToPay.toFixed(2)}</span>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">USD Total</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectAndProceed(offer)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs bg-slate-900 hover:bg-slate-800 text-white active:scale-95"
                  >
                    Select Offer →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomFlightSearch;