import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { Row, Col, Card, Button } from 'react-bootstrap';
import './Home.css';

const Home = ({ marketplace, nft }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [blockHashes, setBlockHashes] = useState([]); // State to store the block hash

  const loadMarketplaceItems = async () => {
    const itemCount = await marketplace.itemCount();
    let items = [];
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i);
      if (!item.sold) {
        try {
          const uri = await nft.tokenURI(item.tokenId);
          const response = await fetch(uri);
          const metadata = await response.json();
          const totalPrice = await marketplace.getTotalPrice(item.itemId);
          items.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/"),
          });
        } catch (error) {
          console.error(`Failed to load data for item ${item.itemId}:`, error);
        }
      }
    }
    setLoading(false);
    setItems(items);
  };

  const buyMarketItem = async (item) => {
    try {
      await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait();
      loadMarketplaceItems();
    } catch (error) {
      console.error('Error purchasing item:', error);
      alert('Failed to purchase item.');
    }
  };

  const fetchBlockHashes = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const latestBlockNumber = await provider.getBlockNumber();
    const hashes = [];
    for (let i = 0; i < 5; i++) { // Fetch the last 5 blocks
      const block = await provider.getBlock(latestBlockNumber - i);
      hashes.push(block.hash);
    }
    setBlockHashes(hashes);
  };

  useEffect(() => {
    loadMarketplaceItems();
    fetchBlockHashes();
    const interval = setInterval(fetchBlockHashes, 30000); // Update hashes every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <main style={{ padding: "1rem 0" }}><h2>Loading...</h2></main>;

  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
                      <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="terminal">
            <h5>Recent Block Hashes:</h5>
            <ul>
              {blockHashes.map((hash, index) => (
                <li key={index} className="terminal-text">{hash}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}><h2>No listed assets</h2></main>
      )}
    </div>
  );
};

export default Home;
