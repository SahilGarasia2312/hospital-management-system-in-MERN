// modules/medicine/medicine.service.js — Pure business logic for medicine catalog management
import Medicine from "./medicine.model.js";
import { NotFoundError, ConflictError, BadRequestError } from "../../core/errors/index.js";
import { createAuditLog } from "../audit/audit.service.js";
import { AUDIT_ACTIONS } from "../../config/constants.js";

/**
 * Generates sequential numeric medicineId safely.
 */
const generateMedicineId = async () => {
  const result = await Medicine.aggregate([
    { $group: { _id: null, maxId: { $max: "$medicineId" } } },
  ]);
  return result.length > 0 ? result[0].maxId + 1 : 1;
};

/**
 * Create a new medicine entry in master catalog
 */
export const createMedicine = async (data, requestingUser = null) => {
  const { name, genericName, dosageForm, strength, manufacturer, unitPrice, stockQuantity, reorderLevel } = data;

  const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existing = await Medicine.findOne({
    name: { $regex: new RegExp(`^${escapedName}$`, "i") },
    strength: strength.trim(),
    dosageForm,
  });

  if (existing) {
    throw new ConflictError(`Medicine '${name}' (${strength}, ${dosageForm}) already exists in catalog.`);
  }

  const medicineId = await generateMedicineId();

  const created = await Medicine.create({
    medicineId,
    name,
    genericName: genericName || "",
    dosageForm,
    strength,
    manufacturer: manufacturer || "",
    unitPrice,
    stockQuantity: stockQuantity || 0,
    reorderLevel: reorderLevel !== undefined ? reorderLevel : 10,
  });

  await createAuditLog({
    actor: requestingUser ? { userId: requestingUser.id, role: requestingUser.role } : { role: "admin" },
    action: AUDIT_ACTIONS.MEDICINE_CREATED,
    resource: { type: "medicine", id: created.medicineId },
    metadata: { name: created.name, strength: created.strength, dosageForm: created.dosageForm, stockQuantity: created.stockQuantity },
  });

  return created;
};

/**
 * List & search medicine catalog with pagination
 */
export const getAllMedicines = async (queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  if (queryParams.search) {
    const searchRegex = new RegExp(queryParams.search, "i");
    filter.$or = [{ name: searchRegex }, { genericName: searchRegex }];
  }

  if (queryParams.dosageForm) {
    filter.dosageForm = queryParams.dosageForm;
  }

  if (queryParams.isActive !== undefined) {
    filter.isActive = queryParams.isActive;
  }

  const total = await Medicine.countDocuments(filter);
  const items = await Medicine.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get medicine by numeric medicineId
 */
export const getMedicineById = async (medicineId) => {
  const medicine = await Medicine.findOne({ medicineId: Number(medicineId) });
  if (!medicine) {
    throw new NotFoundError("Medicine not found in catalog.");
  }
  return medicine;
};

/**
 * Update medicine entry details
 */
export const updateMedicine = async (medicineId, data, requestingUser = null) => {
  const medicine = await Medicine.findOne({ medicineId: Number(medicineId) });
  if (!medicine) {
    throw new NotFoundError("Medicine not found in catalog.");
  }

  const allowedFields = ["name", "genericName", "dosageForm", "strength", "manufacturer", "unitPrice", "stockQuantity", "reorderLevel", "isActive"];
  
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      medicine[field] = data[field];
    }
  });

  await medicine.save();

  await createAuditLog({
    actor: requestingUser ? { userId: requestingUser.id, role: requestingUser.role } : { role: "admin" },
    action: AUDIT_ACTIONS.MEDICINE_UPDATED,
    resource: { type: "medicine", id: medicine.medicineId },
    metadata: { updatedFields: Object.keys(data).filter((k) => allowedFields.includes(k)) },
  });

  return medicine;
};

/**
 * Adjust stock quantity for a medicine
 */
export const updateMedicineStock = async (medicineId, stockQuantity, requestingUser = null) => {
  const medicine = await Medicine.findOne({ medicineId: Number(medicineId) });
  if (!medicine) {
    throw new NotFoundError("Medicine not found in catalog.");
  }

  if (stockQuantity < 0) {
    throw new BadRequestError("Stock quantity cannot be negative.");
  }

  const previousQuantity = medicine.stockQuantity;
  medicine.stockQuantity = stockQuantity;
  await medicine.save();

  await createAuditLog({
    actor: requestingUser ? { userId: requestingUser.id, role: requestingUser.role } : { role: "admin" },
    action: AUDIT_ACTIONS.MEDICINE_STOCK_UPDATED,
    resource: { type: "medicine", id: medicine.medicineId },
    metadata: {
      previousQuantity,
      newQuantity: stockQuantity,
      change: stockQuantity - previousQuantity,
    },
  });

  return medicine;
};
