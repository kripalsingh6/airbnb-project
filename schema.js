const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    propertyType: Joi.string().allow("", null).optional(),
    guests: Joi.number().min(1).optional(),
    bedrooms: Joi.number().min(1).optional(),
    beds: Joi.number().min(1).optional(),
    bathrooms: Joi.number().min(1).optional(),
    image: Joi.object({
      filename: Joi.string().allow("", null),
      url: Joi.string().uri().allow("", null),
    }).allow("", null),
    amenities: Joi.any().optional(),
  }).required(),
  amenities: Joi.any().optional(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});