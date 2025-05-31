const express = require("express");

const user = require("../controllers/userController");
const router = express.Router();
const { validateRegister } = require("../validators/authValidator");

const authMiddleware = require("../middlewares/authMiddleware");
const ensureCustomerRole = require("../middlewares/ensureCustomerRole");

router.get("/getCurrentUser", authMiddleware, user.getCurrentUser);
router.post("/updateCurrentUser", authMiddleware, user.updateCurrentUser);

router.get("/cooks", user.listAllCooks);
router.get("/cooks/:id", user.getCookById);
router.get("/favoritecooks", authMiddleware, user.getFavoriteCooks);

router.post("/favorites/:cookId", authMiddleware, user.addFavoriteCook);

router.delete("/favorites/:cookId", authMiddleware, user.removeFavoriteCook);
// may be not needed remove if you want
// router.post(
//   "/addCustomerAddress",
//   authMiddleware,
//   ensureCustomerRole,
//   user.addCustomerAdress
// );

// Add Address
router.post("/address", authMiddleware, ensureCustomerRole, user.addAddress);
// Get all addresses
router.get(
  "/address",
  authMiddleware,
  ensureCustomerRole,
  user.getAllAddresses
);
// Get address by id
router.get(
  "/address/:addressId",
  authMiddleware,
  ensureCustomerRole,
  user.getAddressById
);
// Edit address by id
router.put(
  "/address/:addressId",
  authMiddleware,
  ensureCustomerRole,
  user.editAddress
);
// Delete address by id
router.delete(
  "/address/:addressId",
  authMiddleware,
  ensureCustomerRole,
  user.deleteAddress
);
// Change main address
router.put(
  "/address/main/:addressId",
  authMiddleware,
  ensureCustomerRole,
  user.changeMainAddress
);

module.exports = router;
