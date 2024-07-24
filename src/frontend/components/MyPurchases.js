import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { Row, Col, Card, Button, Form } from 'react-bootstrap';

export default function MyPurchases({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [transferAddress, setTransferAddress] = useState('');
  const [bridgeAddress, setBridgeAddress] = useState('');

  const loadPurchasedItems = async () => {
    const filter = marketplace.filters.Bought(null, null, null, null, null, account);
    const results = await marketplace.queryFilter(filter);
    const purchases = await Promise.all(results.map(async i => {
      i = i.args;
      const uri = await nft.tokenURI(i.tokenId);
      const response = await fetch(uri);
      const metadata = await response.json();
      const totalPrice = await marketplace.getTotalPrice(i.itemId);
      return {
        totalPrice,
        price: i.price,
        itemId: i.itemId,
        tokenId: i.tokenId,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image
      };
    }));
    setLoading(false);
    setPurchases(purchases);
  };

  const lockToken = async (tokenId) => {
    try {
      const transaction = await nft.lockToken(tokenId);
      await transaction.wait();
      alert('Token locked successfully!');
      loadPurchasedItems();
    } catch (error) {
      alert('Failed to lock token:', error);
    }
  };

  const unlockToken = async (tokenId) => {
    try {
      const transaction = await nft.unlockToken(tokenId);
      await transaction.wait();
      alert('Token unlocked successfully!');
      loadPurchasedItems();
    } catch (error) {
      alert('Failed to unlock token:', error);
    }
  };

  const normalTransfer = async (tokenId, to) => {
    if (!to) {
      alert('Please enter a recipient address for the normal transfer.');
      return;
    }
    try {
      const transaction = await nft.transferFrom(account, to, tokenId);
      await transaction.wait();
      alert('NFT transferred successfully!');
      loadPurchasedItems();
    } catch (error) {
      console.error('Failed to transfer NFT:', error);
      alert('Failed to transfer NFT: ' + error.message);
    }
  };

  const bridgeTransfer = async (tokenId, to) => {
    if (!to) {
      alert('Please enter a recipient address for the bridge transfer.');
      return;
    }
    try {
      const transaction = await nft.bridgeTransfer(to, tokenId);
      await transaction.wait();
      alert('NFT bridged successfully!');
      loadPurchasedItems();
    } catch (error) {
      console.error('Failed to bridge NFT:', error);
      alert('Failed to bridge NFT: ' + error.message);
    }
  };
  
  useEffect(() => {
    if (account) {
      loadPurchasedItems();
    }
  }, [account]);

  if (loading) return <main style={{ padding: "1rem 0" }}><h2>Loading...</h2></main>;

  return (
    <div className="flex justify-center">
      {purchases.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                    <Form.Group className="mb-3">
                      <Form.Control
                        type="text"
                        placeholder="Enter recipient address for normal transfer"
                        onChange={(e) => setTransferAddress(e.target.value)}
                      />
                      <Form.Control
                        type="text"
                        placeholder="Enter recipient address for bridge transfer"
                        onChange={(e) => setBridgeAddress(e.target.value)}
                      />
                    </Form.Group>
                  </Card.Body>
                  <Card.Footer>
                    <div>{ethers.utils.formatEther(item.totalPrice)} ETH</div>
                    <Button variant="info" onClick={() => lockToken(item.tokenId)}>Lock</Button>
                    <Button variant="outline-info" onClick={() => unlockToken(item.tokenId)}>Unlock</Button>
                    <Button variant="primary" onClick={() => normalTransfer(item.tokenId, transferAddress)}>Normal Transfer</Button>
                    <Button variant="warning" onClick={() => bridgeTransfer(item.tokenId, bridgeAddress)}>Bridge Transfer</Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}><h2>No purchases</h2></main>
      )}
    </div>
  );
}
