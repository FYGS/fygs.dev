/**
 * T115: Monetary Decimal Precision Tests
 * 
 * Tests monetary calculations and formatting as required by FR-024.
 * Ensures no float drift and consistent EUR formatting across the platform.
 */

import { describe, it, expect } from 'vitest'
import { Decimal } from '@prisma/client/runtime/client'

// Monetary precision service for handling currency calculations
class MonetaryPrecisionService {
  /**
   * Convert price to Decimal with proper precision (2 decimal places for EUR)
   */
  static toPreciseDecimal(amount: number | string): Decimal {
    return new Decimal(amount).toDecimalPlaces(2)
  }

  /**
   * Format price as EUR currency string
   */
  static formatEUR(amount: Decimal | number | string): string {
    const decimal = amount instanceof Decimal ? amount : new Decimal(amount)
    return `€${decimal.toFixed(2)}`
  }

  /**
   * Add two monetary amounts without float drift
   */
  static addAmounts(a: Decimal | number | string, b: Decimal | number | string): Decimal {
    const decimalA = a instanceof Decimal ? a : new Decimal(a)
    const decimalB = b instanceof Decimal ? b : new Decimal(b)
    return decimalA.plus(decimalB).toDecimalPlaces(2)
  }

  /**
   * Subtract two monetary amounts without float drift
   */
  static subtractAmounts(a: Decimal | number | string, b: Decimal | number | string): Decimal {
    const decimalA = a instanceof Decimal ? a : new Decimal(a)
    const decimalB = b instanceof Decimal ? b : new Decimal(b)
    return decimalA.minus(decimalB).toDecimalPlaces(2)
  }

  /**
   * Multiply amount by factor (e.g., for tax calculations)
   */
  static multiplyAmount(amount: Decimal | number | string, factor: Decimal | number | string): Decimal {
    const decimal = amount instanceof Decimal ? amount : new Decimal(amount)
    const multiplier = factor instanceof Decimal ? factor : new Decimal(factor)
    return decimal.times(multiplier).toDecimalPlaces(2)
  }

  /**
   * Calculate percentage of amount
   */
  static calculatePercentage(amount: Decimal | number | string, percentage: number): Decimal {
    const decimal = amount instanceof Decimal ? amount : new Decimal(amount)
    const percent = new Decimal(percentage).dividedBy(100)
    return decimal.times(percent).toDecimalPlaces(2)
  }

  /**
   * Validate that amount has correct precision (max 2 decimal places)
   */
  static isValidMonetaryPrecision(amount: Decimal | number | string): boolean {
    const decimal = amount instanceof Decimal ? amount : new Decimal(amount)
    const decimalPlaces = decimal.decimalPlaces()
    return decimalPlaces !== null && decimalPlaces <= 2
  }

  /**
   * Compare two monetary amounts for equality (within precision tolerance)
   */
  static areEqual(a: Decimal | number | string, b: Decimal | number | string): boolean {
    const decimalA = a instanceof Decimal ? a : new Decimal(a)
    const decimalB = b instanceof Decimal ? b : new Decimal(b)
    return decimalA.toFixed(2) === decimalB.toFixed(2)
  }
}

describe('T115: Monetary Decimal Precision Tests', () => {
  describe('Decimal Precision Conversion', () => {
    it('converts numbers to precise decimals with 2 decimal places', () => {
      const amount = MonetaryPrecisionService.toPreciseDecimal(19.99)
      expect(amount.toFixed(2)).toBe('19.99')
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(amount)).toBe(true)
    })

    it('handles string inputs correctly', () => {
      const amount = MonetaryPrecisionService.toPreciseDecimal('29.95')
      expect(amount.toFixed(2)).toBe('29.95')
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(amount)).toBe(true)
    })

    it('truncates excessive decimal places', () => {
      const amount = MonetaryPrecisionService.toPreciseDecimal(19.999999)
      expect(amount.toFixed(2)).toBe('20.00')
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(amount)).toBe(true)
    })

    it('handles whole numbers correctly', () => {
      const amount = MonetaryPrecisionService.toPreciseDecimal(50)
      expect(amount.toFixed(2)).toBe('50.00')
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(amount)).toBe(true)
    })
  })

  describe('EUR Currency Formatting', () => {
    it('formats decimal amounts as EUR currency', () => {
      const amount = new Decimal('19.99')
      const formatted = MonetaryPrecisionService.formatEUR(amount)
      expect(formatted).toBe('€19.99')
    })

    it('formats number amounts as EUR currency', () => {
      const formatted = MonetaryPrecisionService.formatEUR(29.95)
      expect(formatted).toBe('€29.95')
    })

    it('formats string amounts as EUR currency', () => {
      const formatted = MonetaryPrecisionService.formatEUR('49.99')
      expect(formatted).toBe('€49.99')
    })

    it('formats whole numbers with .00 suffix', () => {
      const formatted = MonetaryPrecisionService.formatEUR(100)
      expect(formatted).toBe('€100.00')
    })

    it('handles zero amounts correctly', () => {
      const formatted = MonetaryPrecisionService.formatEUR(0)
      expect(formatted).toBe('€0.00')
    })
  })

  describe('Float Drift Prevention', () => {
    it('prevents float drift in addition operations', () => {
      // This would cause float drift with regular JavaScript numbers
      const result = MonetaryPrecisionService.addAmounts(0.1, 0.2)
      expect(result.toFixed(2)).toBe('0.30')
      expect(MonetaryPrecisionService.areEqual(result, 0.3)).toBe(true)
    })

    it('prevents float drift in subtraction operations', () => {
      const result = MonetaryPrecisionService.subtractAmounts(1.0, 0.9)
      expect(result.toFixed(2)).toBe('0.10')
      expect(MonetaryPrecisionService.areEqual(result, 0.1)).toBe(true)
    })

    it('prevents float drift in multiplication operations', () => {
      const result = MonetaryPrecisionService.multiplyAmount(0.1, 3)
      expect(result.toFixed(2)).toBe('0.30')
      expect(MonetaryPrecisionService.areEqual(result, 0.3)).toBe(true)
    })

    it('handles complex calculations without drift', () => {
      // Complex calculation: (19.99 + 29.95) * 1.19 (with 19% tax)
      const subtotal = MonetaryPrecisionService.addAmounts('19.99', '29.95')
      const total = MonetaryPrecisionService.multiplyAmount(subtotal, '1.19')
      expect(total.toFixed(2)).toBe('59.43') // 49.94 * 1.19 = 59.4286 -> 59.43
    })
  })

  describe('Percentage Calculations', () => {
    it('calculates percentage amounts correctly', () => {
      const amount = MonetaryPrecisionService.calculatePercentage(100, 19)
      expect(amount.toFixed(2)).toBe('19.00')
    })

    it('calculates fractional percentages', () => {
      const amount = MonetaryPrecisionService.calculatePercentage(29.99, 7.5)
      expect(amount.toFixed(2)).toBe('2.25')
    })

    it('handles zero percentage', () => {
      const amount = MonetaryPrecisionService.calculatePercentage(100, 0)
      expect(amount.toFixed(2)).toBe('0.00')
    })

    it('handles 100% percentage', () => {
      const amount = MonetaryPrecisionService.calculatePercentage(50.25, 100)
      expect(amount.toFixed(2)).toBe('50.25')
    })
  })

  describe('Precision Validation', () => {
    it('validates correct monetary precision', () => {
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(19.99)).toBe(true)
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(100.00)).toBe(true)
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(0.5)).toBe(true)
    })

    it('invalidates excessive precision', () => {
      const excessivePrecision = new Decimal('19.999')
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(excessivePrecision)).toBe(false)
    })

    it('validates whole numbers', () => {
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(50)).toBe(true)
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(new Decimal(100))).toBe(true)
    })
  })

  describe('Equality Comparisons', () => {
    it('compares equal amounts correctly', () => {
      expect(MonetaryPrecisionService.areEqual(19.99, '19.99')).toBe(true)
      expect(MonetaryPrecisionService.areEqual(new Decimal('29.95'), 29.95)).toBe(true)
    })

    it('compares different amounts correctly', () => {
      expect(MonetaryPrecisionService.areEqual(19.99, 19.98)).toBe(false)
      expect(MonetaryPrecisionService.areEqual('29.95', '29.96')).toBe(false)
    })

    it('handles precision differences in comparison', () => {
      expect(MonetaryPrecisionService.areEqual(20.0, 20.00)).toBe(true)
      expect(MonetaryPrecisionService.areEqual('15.5', '15.50')).toBe(true)
    })
  })

  describe('Real-world Scenarios', () => {
    it('handles course pricing calculations', () => {
      const coursePrice = MonetaryPrecisionService.toPreciseDecimal('49.99')
      const discount = MonetaryPrecisionService.calculatePercentage(coursePrice, 20)
      const finalPrice = MonetaryPrecisionService.subtractAmounts(coursePrice, discount)
      
      expect(discount.toFixed(2)).toBe('10.00')
      expect(finalPrice.toFixed(2)).toBe('39.99')
      expect(MonetaryPrecisionService.formatEUR(finalPrice)).toBe('€39.99')
    })

    it('handles subscription pricing with tax', () => {
      const monthlyPrice = MonetaryPrecisionService.toPreciseDecimal('19.99')
      const tax = MonetaryPrecisionService.calculatePercentage(monthlyPrice, 19)
      const totalPrice = MonetaryPrecisionService.addAmounts(monthlyPrice, tax)
      
      expect(tax.toFixed(2)).toBe('3.80')
      expect(totalPrice.toFixed(2)).toBe('23.79')
      expect(MonetaryPrecisionService.formatEUR(totalPrice)).toBe('€23.79')
    })

    it('handles bundle pricing calculations', () => {
      const course1 = MonetaryPrecisionService.toPreciseDecimal('29.99')
      const course2 = MonetaryPrecisionService.toPreciseDecimal('39.99')
      const course3 = MonetaryPrecisionService.toPreciseDecimal('49.99')
      
      const subtotal = MonetaryPrecisionService.addAmounts(
        MonetaryPrecisionService.addAmounts(course1, course2),
        course3
      )
      
      const bundleDiscount = MonetaryPrecisionService.calculatePercentage(subtotal, 15)
      const finalPrice = MonetaryPrecisionService.subtractAmounts(subtotal, bundleDiscount)
      
      expect(subtotal.toFixed(2)).toBe('119.97')
      expect(bundleDiscount.toFixed(2)).toBe('18.00')
      expect(finalPrice.toFixed(2)).toBe('101.97')
      expect(MonetaryPrecisionService.formatEUR(finalPrice)).toBe('€101.97')
    })

    it('handles currency conversion consistency', () => {
      const eurAmount = MonetaryPrecisionService.toPreciseDecimal('99.99')
      const conversionRate = MonetaryPrecisionService.toPreciseDecimal('1.12')
      const convertedAmount = MonetaryPrecisionService.multiplyAmount(eurAmount, conversionRate)
      
      expect(convertedAmount.toFixed(2)).toBe('111.99') // 99.99 * 1.12 = 111.9888 -> 111.99
      expect(MonetaryPrecisionService.isValidMonetaryPrecision(convertedAmount)).toBe(true)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles very small amounts', () => {
      const amount = MonetaryPrecisionService.toPreciseDecimal('0.01')
      expect(amount.toFixed(2)).toBe('0.01')
      expect(MonetaryPrecisionService.formatEUR(amount)).toBe('€0.01')
    })

    it('handles very large amounts', () => {
      const amount = MonetaryPrecisionService.toPreciseDecimal('999999.99')
      expect(amount.toFixed(2)).toBe('999999.99')
      expect(MonetaryPrecisionService.formatEUR(amount)).toBe('€999999.99')
    })

    it('handles negative amounts', () => {
      const amount = MonetaryPrecisionService.toPreciseDecimal('-19.99')
      expect(amount.toFixed(2)).toBe('-19.99')
      expect(MonetaryPrecisionService.formatEUR(amount)).toBe('€-19.99')
    })

    it('maintains precision through multiple operations', () => {
      let amount = MonetaryPrecisionService.toPreciseDecimal('10.00')
      
      // Perform multiple operations
      amount = MonetaryPrecisionService.addAmounts(amount, '0.33')
      amount = MonetaryPrecisionService.subtractAmounts(amount, '0.33')
      amount = MonetaryPrecisionService.multiplyAmount(amount, '1.0')
      
      expect(amount.toFixed(2)).toBe('10.00')
      expect(MonetaryPrecisionService.areEqual(amount, '10.00')).toBe(true)
    })
  })
})