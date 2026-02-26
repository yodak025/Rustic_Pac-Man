import { type Pattern } from '../patterns/Pattern'
import { type MusicContext } from '../theory/MusicContext'
import { PercussionPatternGenerator } from './PercussionPatternGenerator'
import { BassPatternGenerator } from './BassPatternGenerator'
import { PadPatternGenerator } from './PadPatternGenerator'
import { LeadPatternGenerator } from './LeadPatternGenerator'

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

/**
 * All five generated patterns for one musical bar.
 */
export interface GeneratedPatterns {
  percussion: Pattern
  bass: Pattern
  pad: Pattern
  lead1: Pattern
  lead2: Pattern
}

/**
 * PatternGenerator
 *
 * Facade that coordinates all per-instrument generators and applies the
 * cascade chain (percussion → bass → pad → lead1/lead2).
 *
 * Usage:
 * ```ts
 * const gen = new PatternGenerator()
 * const patterns = gen.generate(context)
 * ```
 *
 * Open/Closed: each sub-generator is independently swappable; this class
 * only orchestrates the call order and cascade wiring.
 */
export class PatternGenerator {
  private readonly percussionGen = new PercussionPatternGenerator()
  private readonly bassGen       = new BassPatternGenerator()
  private readonly padGen        = new PadPatternGenerator()
  private readonly leadGen       = new LeadPatternGenerator()

  /**
   * Generates a full set of patterns for all instrument layers in one call.
   * The cascade is applied automatically:
   *   Percussion → Bass → Pad → Lead1 (primary) → Lead2 (harmony of Lead1)
   */
  generate(context: MusicContext): GeneratedPatterns {
    const percussion = this.percussionGen.generate(context)
    const bass       = this.bassGen.generate(context, percussion)
    const pad        = this.padGen.generate(context, bass)
    const lead1      = this.leadGen.generate(context, pad)
    const lead2      = this.leadGen.generateHarmony(context, lead1)

    return { percussion, bass, pad, lead1, lead2 }
  }

  /**
   * Generates only the percussion pattern.
   * Useful when only the drum layer needs refreshing.
   */
  generatePercussion(context: MusicContext): Pattern {
    return this.percussionGen.generate(context)
  }

  /**
   * Generates only the bass pattern given an existing percussion pattern.
   */
  generateBass(context: MusicContext, percussionPattern: Pattern): Pattern {
    return this.bassGen.generate(context, percussionPattern)
  }

  /**
   * Generates only the pad pattern given an existing bass pattern.
   */
  generatePad(context: MusicContext, bassPattern: Pattern): Pattern {
    return this.padGen.generate(context, bassPattern)
  }

  /**
   * Generates only the Lead1 melody given an existing pad pattern.
   */
  generateLead1(context: MusicContext, padPattern: Pattern): Pattern {
    return this.leadGen.generate(context, padPattern)
  }

  /**
   * Generates only the Lead2 harmony given an existing Lead1 pattern.
   */
  generateLead2(context: MusicContext, lead1Pattern: Pattern): Pattern {
    return this.leadGen.generateHarmony(context, lead1Pattern)
  }
}
