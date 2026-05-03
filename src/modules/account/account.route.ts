import express, { RequestHandler } from "express";
import { validateZod } from "../../middlewares/validate.middleware";
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
} from "./account.schema";
import { AccountController } from "./account.controller";
import { asyncHandler, requireAuth } from "@teleshop/common";

const router = express.Router();
const requireAuthMw = requireAuth as unknown as RequestHandler;

router.use(requireAuthMw);

// --- PROFILE ROUTES ---
router.get("/profile/me", asyncHandler(AccountController.getMyProfile as any));

router.put(
  "/profile/me",
  validateZod(updateProfileSchema),
  asyncHandler(AccountController.updateMyProfile as any),
);

// --- ADDRESS ROUTES ---
router.post(
  "/addresses",
  validateZod(createAddressSchema),
  asyncHandler(AccountController.createAddress as any),
);

router.put(
  "/addresses/:id",
  validateZod(updateAddressSchema),
  asyncHandler(AccountController.updateAddress as any),
);

router.delete(
  "/addresses/:id",
  asyncHandler(AccountController.deleteAddress as any),
);

export { router as accountRouter };
