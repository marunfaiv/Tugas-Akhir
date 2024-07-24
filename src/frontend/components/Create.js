import { useState } from 'react';
import { ethers } from "ethers";
import { Row, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const apiKey = "e87cd77dd1a709a5037d";
const apiSecret = "7b1fc1428489c79ec9618ffd0500c7b9c46af32abb29184556326f1c45442521";

const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== 'undefined') {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            pinata_api_key: apiKey,
            pinata_secret_api_key: apiSecret,
          },
        });
        const ipfsHash = res.data.IpfsHash;
        setImage(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      } catch (error) {
        console.error("IPFS image upload error: ", error);
      }
    }
  };

  const createNFT = async () => {
    if (!image || !price || !name || !description) return;
  
    try {
      const metadata = JSON.stringify({
        pinataMetadata: {
          name: `${name}_metadata.json` // Setting a name for the metadata file
        },
        pinataContent: {
          name,
          description,
          image, // Ensure this is a full URI to an image hosted on IPFS
          attributes: [
            {
              trait_type: "Price",
              value: price.toString(),
            },
          ],
        },
      });
  
      const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
        },
      });
  
      mintThenList(res.data.IpfsHash);
    } catch (error) {
      console.error("IPFS URI upload error: ", error);
    }
  };
  

  const mintThenList = async (ipfsHash) => {
    const uri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    // mint nft 
    await (await nft.mint(uri)).wait();
    // get tokenId of new nft 
    const id = await nft.tokenCount();
    // approve marketplace to spend nft
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create;
