#!/usr/bin/env node

/**
 * Meilisearch Setup Script
 * Creates search index and populates it with sample data
 */

const fetch = require('node-fetch');

const MEILISEARCH_URL = process.env.MEILISEARCH_URL || 'http://localhost:7701';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || '91RkaSPLkqMRqx9zv7IkI46fp3OWZR5O5aJuYulPMqjfyLulJI8twoPfXVDRqBT7kmr5qomSqvG6BFO19o3gtBIFcxQYP9irQKd7SzgiJyFKRk1br';

// Sample search data
const searchData = [
  {
    id: 'germany',
    title: 'Germany',
    description: 'Relocate to Germany - visa requirements, cost of living, and job opportunities. Germany offers excellent work-life balance, strong economy, and central European location.',
    type: 'country',
    url: '/en/countries/germany',
    locale: 'en',
    tags: ['europe', 'schengen', 'work-permit', 'visa', 'eu', 'german'],
    content: 'Germany is one of the most popular destinations for international relocation. The country offers various visa options including work permits, student visas, and family reunification. The cost of living varies by city, with Munich and Hamburg being more expensive than Berlin. Germany has a strong economy with opportunities in tech, engineering, and healthcare sectors.'
  },
  {
    id: 'canada',
    title: 'Canada',
    description: 'Move to Canada - Express Entry, provincial programs, and lifestyle. Canada offers excellent healthcare, education, and multicultural society.',
    type: 'country',
    url: '/en/countries/canada',
    locale: 'en',
    tags: ['north-america', 'express-entry', 'provincial-nominee', 'work-permit', 'immigration'],
    content: 'Canada is known for its welcoming immigration policies and high quality of life. The Express Entry system is the main pathway for skilled workers. Provincial Nominee Programs offer additional opportunities. Canada offers universal healthcare, excellent education system, and diverse job market.'
  },
  {
    id: 'australia',
    title: 'Australia',
    description: 'Relocate to Australia - skilled migration, work visas, and quality of life. Australia offers beautiful landscapes, strong economy, and outdoor lifestyle.',
    type: 'country',
    url: '/en/countries/australia',
    locale: 'en',
    tags: ['oceania', 'skilled-migration', 'work-visa', 'points-system', 'immigration'],
    content: 'Australia is a popular destination for skilled migrants. The country uses a points-based system for immigration. Major cities like Sydney, Melbourne, and Brisbane offer diverse job opportunities. Australia has excellent healthcare, education, and work-life balance.'
  },
  {
    id: 'netherlands',
    title: 'Netherlands',
    description: 'Relocate to Netherlands - 30% ruling, work permits, and expat life. Netherlands offers excellent infrastructure, English-friendly environment, and central European location.',
    type: 'country',
    url: '/en/countries/netherlands',
    locale: 'en',
    tags: ['europe', 'schengen', '30-percent-ruling', 'work-permit', 'eu', 'dutch'],
    content: 'The Netherlands is a popular destination for international workers, especially in tech and finance. The 30% ruling provides significant tax benefits for expats. The country has excellent English proficiency and international business environment.'
  },
  {
    id: 'switzerland',
    title: 'Switzerland',
    description: 'Move to Switzerland - work permits, taxes, and quality of life. Switzerland offers high salaries, excellent healthcare, and beautiful landscapes.',
    type: 'country',
    url: '/en/countries/switzerland',
    locale: 'en',
    tags: ['europe', 'work-permit', 'high-salary', 'quality-of-life', 'neutral'],
    content: 'Switzerland offers some of the highest salaries in Europe and excellent quality of life. The country has a complex permit system but offers great opportunities for skilled workers. Switzerland is known for its banking, pharmaceutical, and technology sectors.'
  },
  {
    id: 'visa-requirements',
    title: 'Visa Requirements',
    description: 'Complete guide to visa requirements for different countries. Learn about work permits, student visas, and family reunification.',
    type: 'guide',
    url: '/en/guides/visa-requirements',
    locale: 'en',
    tags: ['visa', 'requirements', 'documentation', 'process', 'immigration'],
    content: 'Understanding visa requirements is crucial for international relocation. Different countries have various visa categories including work permits, student visas, tourist visas, and family reunification. Requirements typically include passport, proof of funds, health insurance, and background checks.'
  },
  {
    id: 'cost-of-living',
    title: 'Cost of Living Calculator',
    description: 'Compare cost of living between countries and cities. Calculate expenses for housing, food, transportation, and healthcare.',
    type: 'feature',
    url: '/en/compare/cost-of-living',
    locale: 'en',
    tags: ['cost-of-living', 'calculator', 'comparison', 'expenses', 'budget'],
    content: 'Cost of living varies significantly between countries and cities. Major expenses include housing, food, transportation, healthcare, and education. Our calculator helps you compare costs and plan your budget for international relocation.'
  },
  {
    id: 'tax-comparison',
    title: 'Tax Comparison',
    description: 'Compare tax systems and rates across different countries. Understand income tax, corporate tax, and social security contributions.',
    type: 'feature',
    url: '/en/compare/taxes',
    locale: 'en',
    tags: ['taxes', 'comparison', 'tax-system', 'rates', 'income-tax'],
    content: 'Tax systems vary greatly between countries. Some countries have progressive tax systems, while others have flat rates. Understanding tax obligations is crucial for financial planning during international relocation.'
  },
  {
    id: 'healthcare-systems',
    title: 'Healthcare Systems',
    description: 'Compare healthcare systems and insurance requirements. Learn about public vs private healthcare and coverage options.',
    type: 'feature',
    url: '/en/compare/healthcare',
    locale: 'en',
    tags: ['healthcare', 'insurance', 'medical', 'comparison', 'coverage'],
    content: 'Healthcare systems vary between countries. Some offer universal healthcare, while others rely on private insurance. Understanding healthcare coverage and costs is essential for international relocation planning.'
  },
  {
    id: 'relocation-checklist',
    title: 'Relocation Checklist',
    description: 'Step-by-step checklist for international relocation. Plan your move with our comprehensive guide.',
    type: 'guide',
    url: '/en/guides/relocation-checklist',
    locale: 'en',
    tags: ['checklist', 'relocation', 'steps', 'planning', 'move'],
    content: 'International relocation involves many steps and considerations. Our checklist covers visa applications, housing, banking, healthcare, education, and cultural adaptation. Proper planning ensures a smooth transition.'
  },
  // German entries
  {
    id: 'germany-de',
    title: 'Deutschland',
    description: 'Nach Deutschland umziehen - Visabestimmungen, Lebenshaltungskosten und Jobmöglichkeiten',
    type: 'country',
    url: '/de/countries/germany',
    locale: 'de',
    tags: ['europa', 'schengen', 'arbeitserlaubnis', 'visum', 'fachkräfte'],
    content: 'Deutschland ist ein beliebtes Ziel für internationale Umzüge. Das Land bietet viele Möglichkeiten für Fachkräfte, Studenten und Unternehmer. Die Wirtschaft ist stark und die Lebensqualität hoch.'
  },
  {
    id: 'canada-de',
    title: 'Kanada',
    description: 'Nach Kanada auswandern - Express Entry, Provinzprogramme und Lebensstil',
    type: 'country',
    url: '/de/countries/canada',
    locale: 'de',
    tags: ['nordamerika', 'express-entry', 'provinz-nominee', 'arbeitserlaubnis', 'einwanderung'],
    content: 'Kanada ist bekannt für sein Einwanderungssystem und die hohe Lebensqualität. Express Entry ist der Hauptweg für qualifizierte Einwanderer. Das Land bietet viele Möglichkeiten für Fachkräfte.'
  },
  {
    id: 'australia-de',
    title: 'Australien',
    description: 'Nach Australien auswandern - Fachkräfteeinwanderung, Arbeitsvisa und Lebensqualität',
    type: 'country',
    url: '/de/countries/australia',
    locale: 'de',
    tags: ['ozeanien', 'fachkräfteeinwanderung', 'arbeitsvisum', 'punkte-system', 'skilled-migration'],
    content: 'Australien verwendet ein Punkte-basiertes System für die Einwanderung. Das Land sucht qualifizierte Fachkräfte in verschiedenen Bereichen. Die Lebensqualität ist hoch und das Klima angenehm.'
  },
  {
    id: 'visa-requirements-de',
    title: 'Visabestimmungen',
    description: 'Vollständiger Leitfaden zu Visabestimmungen für verschiedene Länder',
    type: 'guide',
    url: '/de/guides/visa-requirements',
    locale: 'de',
    tags: ['visum', 'bestimmungen', 'dokumentation', 'prozess', 'einwanderung'],
    content: 'Das Verständnis der Visabestimmungen ist entscheidend für internationale Umzüge. Verschiedene Länder haben unterschiedliche Visakategorien und Anforderungen. Eine sorgfältige Planung ist wichtig.'
  },
  {
    id: 'cost-of-living-de',
    title: 'Lebenshaltungskosten Rechner',
    description: 'Lebenshaltungskosten zwischen Ländern und Städten vergleichen',
    type: 'feature',
    url: '/de/compare/cost-of-living',
    locale: 'de',
    tags: ['lebenshaltungskosten', 'rechner', 'vergleich', 'ausgaben', 'budget'],
    content: 'Die Lebenshaltungskosten variieren erheblich zwischen Ländern und Städten. Wichtige Ausgaben sind Wohnen, Essen, Transport, Gesundheit und Bildung. Unser Rechner hilft bei der Budgetplanung.'
  },
  {
    id: 'tax-comparison-de',
    title: 'Steuervergleich',
    description: 'Steuersysteme und -sätze zwischen verschiedenen Ländern vergleichen',
    type: 'feature',
    url: '/de/compare/taxes',
    locale: 'de',
    tags: ['steuern', 'vergleich', 'steuersystem', 'sätze', 'einkommensteuer'],
    content: 'Steuersysteme variieren stark zwischen Ländern. Einige Länder haben progressive Steuersysteme, andere haben Pauschalsätze. Das Verständnis der Steuerpflichten ist wichtig für die Finanzplanung.'
  },
  {
    id: 'healthcare-systems-de',
    title: 'Gesundheitssysteme',
    description: 'Gesundheitssysteme und Versicherungsanforderungen vergleichen',
    type: 'feature',
    url: '/de/compare/healthcare',
    locale: 'de',
    tags: ['gesundheit', 'versicherung', 'medizin', 'vergleich', 'abdeckung'],
    content: 'Gesundheitssysteme variieren zwischen Ländern. Einige bieten universelle Gesundheitsversorgung, andere verlassen sich auf private Versicherungen. Das Verständnis der Gesundheitsversorgung ist wichtig.'
  },
  {
    id: 'relocation-checklist-de',
    title: 'Umzugs-Checkliste',
    description: 'Schritt-für-Schritt Checkliste für internationale Umzüge',
    type: 'guide',
    url: '/de/guides/relocation-checklist',
    locale: 'de',
    tags: ['checkliste', 'umzug', 'schritte', 'planung', 'auswanderung'],
    content: 'Internationale Umzüge beinhalten viele Schritte und Überlegungen. Unsere Checkliste deckt Visumanträge, Wohnungssuche, Bankgeschäfte, Gesundheit, Bildung und kulturelle Anpassung ab.'
  }
];

async function makeRequest(endpoint, options = {}) {
  const url = `${MEILISEARCH_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${MEILISEARCH_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Meilisearch API error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function createIndex() {
  console.log('🔍 Creating search index...');
  
  try {
    // Create the search index
    await makeRequest('/indexes', {
      method: 'POST',
      body: JSON.stringify({
        uid: 'search',
        primaryKey: 'id'
      })
    });
    console.log('✅ Search index created successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Search index already exists');
    } else {
      throw error;
    }
  }
}

async function configureIndex() {
  console.log('⚙️  Configuring search index...');
  
  try {
    // Configure searchable attributes
    await makeRequest('/indexes/search/settings/searchable-attributes', {
      method: 'PUT',
      body: JSON.stringify(['title', 'description', 'content', 'tags'])
    });

    // Configure filterable attributes
    await makeRequest('/indexes/search/settings/filterable-attributes', {
      method: 'PUT',
      body: JSON.stringify(['type', 'locale', 'tags'])
    });

    // Configure sortable attributes
    await makeRequest('/indexes/search/settings/sortable-attributes', {
      method: 'PUT',
      body: JSON.stringify(['title', 'type'])
    });

    // Configure ranking rules
    await makeRequest('/indexes/search/settings/ranking-rules', {
      method: 'PUT',
      body: JSON.stringify([
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness'
      ])
    });

    console.log('✅ Search index configured successfully');
  } catch (error) {
    console.error('❌ Error configuring index:', error.message);
    throw error;
  }
}

async function addDocuments() {
  console.log('📄 Adding documents to search index...');
  
  try {
    await makeRequest('/indexes/search/documents', {
      method: 'POST',
      body: JSON.stringify(searchData)
    });
    console.log(`✅ Added ${searchData.length} documents to search index`);
  } catch (error) {
    console.error('❌ Error adding documents:', error.message);
    throw error;
  }
}

async function getIndexStats() {
  console.log('📊 Getting index statistics...');
  
  try {
    const stats = await makeRequest('/indexes/search/stats');
    console.log('📈 Index Statistics:');
    console.log(`   - Number of documents: ${stats.numberOfDocuments}`);
    console.log(`   - Index size: ${stats.indexSize}`);
    console.log(`   - Last update: ${stats.lastUpdate}`);
  } catch (error) {
    console.error('❌ Error getting stats:', error.message);
  }
}

async function testSearch() {
  console.log('🔍 Testing search functionality...');
  
  try {
    const testQueries = ['germany', 'visa', 'cost of living', 'taxes'];
    
    for (const query of testQueries) {
      const results = await makeRequest('/indexes/search/search', {
        method: 'POST',
        body: JSON.stringify({
          q: query,
          limit: 3
        })
      });
      
      console.log(`   Query: "${query}" - Found ${results.hits.length} results`);
      if (results.hits.length > 0) {
        console.log(`     Top result: ${results.hits[0].title}`);
      }
    }
  } catch (error) {
    console.error('❌ Error testing search:', error.message);
  }
}

async function main() {
  console.log('🚀 Setting up Meilisearch for Xandhopp...');
  console.log(`📍 Meilisearch URL: ${MEILISEARCH_URL}`);
  console.log(`🔑 API Key: ${MEILISEARCH_API_KEY.substring(0, 10)}...`);
  console.log('');

  try {
    await createIndex();
    await configureIndex();
    await addDocuments();
    await getIndexStats();
    await testSearch();
    
    console.log('');
    console.log('🎉 Meilisearch setup completed successfully!');
    console.log('');
    console.log('🔗 You can now:');
    console.log('   - Use the search form in the header');
    console.log('   - Access Meilisearch dashboard at:', `${MEILISEARCH_URL}`);
    console.log('   - Test the search API at: /api/search');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Check if Meilisearch is running
async function checkMeilisearch() {
  try {
    await makeRequest('/health');
    return true;
  } catch (error) {
    return false;
  }
}

// Run the setup
if (require.main === module) {
  checkMeilisearch().then(isRunning => {
    if (!isRunning) {
      console.error('❌ Meilisearch is not running!');
      console.log('💡 Start Meilisearch with: docker compose up -d meilisearch');
      process.exit(1);
    }
    main();
  });
}

module.exports = { createIndex, configureIndex, addDocuments, getIndexStats, testSearch };
