/**
 * NeDB Helper Functions
 * Utility functions for working with NeDB async operations
 */

import Database from 'nedb';

/**
 * Promisify NeDB find operation
 */
export function findOne(db: Database, query: any): Promise<any> {
  return new Promise((resolve, reject) => {
    db.findOne(query, (err: Error | null, doc: any) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
}

/**
 * Promisify NeDB find operation (returns array)
 */
export function find(db: Database, query: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.find(query, (err: Error | null, docs: any[]) => {
      if (err) reject(err);
      else resolve(docs || []);
    });
  });
}

/**
 * Promisify NeDB find with sort
 */
export function findWithSort(db: Database, query: any, sortField: string, sortOrder: number = 1): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.find(query)
      .sort({ [sortField]: sortOrder })
      .exec((err: Error | null, docs: any[]) => {
        if (err) reject(err);
        else resolve(docs || []);
      });
  });
}

/**
 * Promisify NeDB find with limit
 */
export function findWithLimit(db: Database, query: any, limit: number): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.find(query)
      .limit(limit)
      .exec((err: Error | null, docs: any[]) => {
        if (err) reject(err);
        else resolve(docs || []);
      });
  });
}

/**
 * Promisify NeDB find with skip and limit
 */
export function findWithPagination(
  db: Database,
  query: any,
  skip: number,
  limit: number,
  sortField: string = 'createdAt',
  sortOrder: number = -1
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec((err: Error | null, docs: any[]) => {
        if (err) reject(err);
        else resolve(docs || []);
      });
  });
}

/**
 * Promisify NeDB insert operation
 */
export function insert(db: Database, doc: any): Promise<any> {
  return new Promise((resolve, reject) => {
    db.insert(doc, (err: Error | null, newDoc: any) => {
      if (err) reject(err);
      else resolve(newDoc);
    });
  });
}

/**
 * Promisify NeDB update operation
 */
export function update(db: Database, query: any, update: any, options: any = {}): Promise<number> {
  return new Promise((resolve, reject) => {
    db.update(query, update, options, (err: Error | null, numReplaced: number) => {
      if (err) reject(err);
      else resolve(numReplaced);
    });
  });
}

/**
 * Promisify NeDB remove operation
 */
export function remove(db: Database, query: any, options: any = {}): Promise<number> {
  return new Promise((resolve, reject) => {
    db.remove(query, options, (err: Error | null, numRemoved: number) => {
      if (err) reject(err);
      else resolve(numRemoved);
    });
  });
}

/**
 * Promisify NeDB count operation
 */
export function count(db: Database, query: any): Promise<number> {
  return new Promise((resolve, reject) => {
    db.count(query, (err: Error | null, count: number) => {
      if (err) reject(err);
      else resolve(count);
    });
  });
}

/**
 * Generate CUID-like ID
 */
export function generateId(): string {
  return 'c' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
}
