
/**
 * Module Dependencies
 */

var _ = require('lodash'),
    ObjectId = require('mongodb').ObjectId;

/**
 * Document
 *
 * Represents a single document in a collection. Responsible for serializing values before
 * writing to a collection.
 *
 * @param {Object} values
 * @param {Object} schema
 * @api private
 */

var Document = module.exports = function Document(values, schema) {

  // Keep track of the current document's values
  this.values = {};

  // Grab the schema for normalizing values
  this.schema = schema || {};

  // If values were passed in, use the setter
  if(values) this.values = this.setValues(values);

  return this;
};

/**
 * Set values
 *
 * Normalizes values into proper formats.
 *
 * @param {Object} values
 * @return {Object}
 * @api private
 */

Document.prototype.setValues = function setValues(values) {
  this.normalizeId(values);
  this.serializeValues(values);

  return values;
};

/**
 * Normalize ID's
 *
 * Moves values.id into the preferred mongo _id field.
 *
 * @param {Object} values
 * @api private
 */

Document.prototype.normalizeId = function normalizeId(values) {

  if(!values.id) return;

  // Check if data.id looks like a MongoID
  if(_.isString(values.id) && values.id.match(/^[a-fA-F0-9]{24}$/)) {
    values.id = new ObjectID.createFromHexString(values.id);
  }

  values._id = _.cloneDeep(values.id);
  delete values.id;
};

/**
 * Serialize Insert Values
 *
 * @param {Object} values
 * @return {Object}
 * @api private
 */

Document.prototype.serializeValues = function serializeValues(values) {
  var self = this;

  Object.keys(values).forEach(function(key) {
    var type = self.schema[key].type,
        val;

    if(type === 'json') {
      try {
        val = JSON.parse(values[key]);
      } catch(e) {
        return;
      }
      values[key] = val;
    }
  });

  return values;
};