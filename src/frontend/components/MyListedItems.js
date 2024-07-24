import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'

function renderSoldItems(items) {
  return (
    <>
      <h2>Sold</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card>
              <Card.Img variant="top" src={item.image} />
              <Card.Footer>
                For {ethers.utils.formatEther(item.totalPrice)} ETH - Recieved {ethers.utils.formatEther(item.price)} ETH
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}

export default function MyListedItems({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [listedItems, setListedItems] = useState([])
  const [soldItems, setSoldItems] = useState([])
  const loadListedItems = async () => {
    const itemCount = await marketplace.itemCount();
    let listedItems = [];
    let soldItems = [];
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await marketplace.items(indx);
      if (i.seller.toLowerCase() === account) {
        const tokenId = i.tokenId.toNumber();  // Convert BigNumber to number
        const uri = await nft.tokenURI(tokenId);
        const owner = await nft.ownerOf(tokenId); // Fetch current owner of the NFT
        try {
          const response = await fetch(uri);
          const metadata = await response.json();
          if (metadata && metadata.image) {
            const imageUrl = metadata.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
            const totalPrice = await marketplace.getTotalPrice(i.itemId);
            let item = {
              totalPrice,
              price: i.price,
              itemId: i.itemId,
              name: metadata.name,
              description: metadata.description,
              image: imageUrl,
              currentOwner: owner  // Store the owner's address in the item object
            };
            listedItems.push(item);
            if (i.sold) soldItems.push(item);
          } else {
            console.error("Metadata does not contain an image for tokenId:", tokenId);
          }
        } catch (error) {
          console.error("Failed to fetch metadata for tokenId:", tokenId, error);
        }
      }
    }
    setLoading(false);
    setListedItems(listedItems);
    setSoldItems(soldItems);
  };    
  useEffect(() => {
    loadListedItems()
  }, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>There are no listed item yet...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {listedItems.length > 0 ?
        <div className="px-5 py-3 container">
            <h2>Listed</h2>
            <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {listedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                    <Card.Text>Owner: {item.currentOwner}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div>{ethers.utils.formatEther(item.totalPrice)} ETH</div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
            {soldItems.length > 0 && renderSoldItems(soldItems)}
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}