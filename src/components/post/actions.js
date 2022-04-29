import { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import FirebaseContext from '../../context/firebase';
import UserContext from '../../context/user';
import Web3 from 'web3';
import Tip from '../../abis/Tip.json';


export default function Actions({ docId, totalLikes, likedPhoto, handleFocus, basePrice, price ,tokenId}) {
  const {
    user: { uid: userId }
  } = useContext(UserContext);
  const [toggleLiked, setToggleLiked] = useState(likedPhoto);
  const [likes, setLikes] = useState(totalLikes);
  const [currprice, setcurrprice] = useState(price);
  const { firebase, FieldValue } = useContext(FirebaseContext);
  const [acc,setAcc] = useState(null);
  const [ tipp, setTip ] = useState(null);
  const [ amt, setAmt ] = useState('');
  const [ id, setid ] = useState('');
  const [ pu, setpu ] = useState('');
  useEffect( () => {
    async function fetchData() {
      await loadWeb3();
      await loadBlockchainData();
    }
    fetchData();
  }, []);


 const loadWeb3 = async ()=> {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  }
  else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  }
  else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }
}

const loadBlockchainData = async() =>{
  const web3 = window.web3
  // Load account
  const accounts = await web3.eth.getAccounts()
  setAcc(accounts[0])
  // Network ID
  const networkId = await web3.eth.net.getId()
  const networkData = Tip.networks[networkId]
  if(networkData) {
    const tip = new web3.eth.Contract(Tip.abi, networkData.address);
    setTip(tip)
  }else{
    console.log("Contract not deployed");
  }
}


  const handleToggleLiked = async () => {
    setToggleLiked((toggleLiked) => !toggleLiked);

    setLikes((likes) => (toggleLiked ? parseInt(likes) - 1 : parseInt(likes) + 1));
    setcurrprice((currprice) => (toggleLiked ? parseInt(basePrice) : parseInt(basePrice) + parseInt(likes) * 0.001));
    console.log(currprice);
    await firebase
      .firestore()
      .collection('photos')
      .doc(docId)
      .update({
        likes: toggleLiked ? FieldValue.arrayRemove(userId) : FieldValue.arrayUnion(userId),
        price: toggleLiked ? parseInt(basePrice) : parseInt(basePrice) + parseInt(likes) * (1 / 10000)
      });
    console.log(price);
    // Pass the price to another function or Component which displays the button.
    // Add price to firestore
    // await firebase.firestore.collection('photos').update({ F });
  };
  
  const handleLend = async (event) => {
    await firebase.firestore().collection("photos").doc(docId).get().then((snapshot) => {
      setid(snapshot.photoId)
      setpu(snapshot.userId)
    })
    let tipAmount = window.web3.utils.toWei('12', 'Ether')
    console.log(docId, tipAmount)
    const image = await tipp.methods.images(docId).call()
    setAmt(image.tipAmount);
    if (image.id !== "") {
      tipp.methods.tipImageOwner(docId).send({ from: acc, value: tipAmount }).
        on('transactionHash', async (hash) => {
          await firebase
            .firestore()
            .collection("photos")
            .doc(docId)
            .update({
              userId: userId
            })
          
          await firebase
					.firestore()
					.collection("users")
					.doc(docId)
					.update({
						photos: firebase.firestore.FieldValue.arrayRemove(
							id
						)
          });
          
          await firebase
				.firestore()
				.collection("users")
				.doc(pu)
				.update({
					photos: firebase.firestore.FieldValue.arrayUnion(id),
				});
			})
    } else {
      console.log("Image doesn't exist in blockchain")
    }
    console.log(amt);
}



  return (
    <>
      <div className="flex justify-between p-4">
        <div className="flex">
          <svg
            onClick={handleToggleLiked}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleToggleLiked();
              }
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            tabIndex={0}
            className={`w-8 mr-4 select-none cursor-pointer focus:outline-none ${
              toggleLiked ? 'fill-red text-red-primary' : 'text-black-light'
            }`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {/* price details */}         
          {<p className="font-bold">Price: ${currprice}</p>}
          <button type="button" onClick={handleLend} className="text-white bg-[#050708] hover:bg-[#050708]/90 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center  dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30  mb-2" style={{marginLeft: "10rem"}}>
                  Lend
          </button>
        </div>
      </div>
      <div className="p-4 py-0">
        <p className="font-bold">{`${likes} interested`}</p>
      </div>
    </>
  );
}

Actions.propTypes = {
  docId: PropTypes.string.isRequired,
  totalLikes: PropTypes.number.isRequired,
  likedPhoto: PropTypes.bool.isRequired,
  handleFocus: PropTypes.func.isRequired,
  basePrice: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired
};
