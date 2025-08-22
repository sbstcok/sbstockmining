interface CoinData {
  name: string;
  symbol: string;
  id: string;
}

interface CoinMap {
  [key: string]: CoinData;
}

// Map of display names to CoinMarketCap IDs
const coinMap: CoinMap = {
  BTC: { name: "Bitcoin", symbol: "BTC", id: "bitcoin" },
  ETH: { name: "Ethereum", symbol: "ETH", id: "ethereum" },
  SOL: { name: "Solana", symbol: "SOL", id: "solana" },
  ADA: { name: "Cardano", symbol: "ADA", id: "cardano" },
  MATIC: { name: "Polygon", symbol: "MATIC", id: "polygon" },
  LINK: { name: "Chainlink", symbol: "LINK", id: "chainlink" }
};

// Sample data to use on error
const sampleData = {
  bitcoin: { usd: 29850, usd_24h_change: 2.5 },
  ethereum: { usd: 1780, usd_24h_change: 1.8 },
  solana: { usd: 21.5, usd_24h_change: 3.2 },
  cardano: { usd: 0.28, usd_24h_change: -1.5 },
  polygon: { usd: 0.58, usd_24h_change: 0.9 },
  chainlink: { usd: 6.2, usd_24h_change: 1.2 }
};

export async function fetchCryptoData() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const ids = Object.values(coinMap).map(coin => coin.id).join(",");
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?slug=${ids}&convert=USD`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-CMC_PRO_API_KEY': '2125c0fe-6d23-4803-a0f0-e2eaaf412adb'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (response.status === 429 || !response.ok) {
      return formatSampleData();
    }

    const data = await response.json();

    // Transform API data
    return Object.keys(coinMap).map(symbol => {
      const coin = coinMap[symbol];
      const coinData = data.data[coin.id];
      const price = coinData?.quote.USD.price || 0;
      const change = coinData?.quote.USD.percent_change_24h || 0;
      return {
        name: coin.name,
        symbol: coin.symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(Math.abs(change).toFixed(2)),
        positive: change >= 0
      };
    });
  } catch (error) {
    return formatSampleData();
  }
}

function formatSampleData() {
  return Object.keys(coinMap).map(symbol => {
    const coin = coinMap[symbol];
    const price = sampleData[coin.id]?.usd || 0;
    const change = sampleData[coin.id]?.usd_24h_change || 0;
    return {
      name: coin.name,
      symbol: coin.symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(Math.abs(change).toFixed(2)),
      positive: change >= 0
    };
  });
}
