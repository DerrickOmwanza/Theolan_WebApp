#!/usr/bin/env node

/**
 * Run product description updates from SQL file
 * Usage: node backend/scripts/run_product_updates.js
 */

import knex from './knexfile.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const updates = [
  {
    name: 'Aluminium Railing — Horizontal Bars',
    description: `Crafted from powder-coated aluminium in a matte black finish, this railing system offers exceptional resistance to corrosion and weathering. The horizontal bar design with minimal posts ensures structural integrity while maintaining a sleek, contemporary aesthetic. Ideal for terraces and balconies, it combines durability with modern architectural appeal.`
  },
  {
    name: 'Glass Balustrade — Frameless',
    description: `This frameless balustrade system uses thick, toughened laminated glass panels secured by a heavy-duty aluminium base channel. The design eliminates visible hardware, providing a seamless panoramic view while meeting stringent safety standards. Its robust construction ensures long-term performance in both coastal and urban environments.`
  },
  {
    name: 'Glass Balustrade — Post System',
    description: `Featuring polished aluminium posts with stainless steel clamps, this balustrade supports clear tempered glass infill panels for maximum transparency. The continuous top handrail enhances safety and stability while maintaining a refined architectural look. Designed for staircases and mezzanines, it balances elegance with strength and reliability.`
  },
  {
    name: 'Juliet Balcony Balustrade',
    description: `Engineered with a single tempered glass panel, this Juliet balcony is side-fixed using brushed stainless steel brackets for a minimalist finish. It provides secure protection for French door openings while preserving unobstructed views. The system's durable materials ensure longevity and resistance to environmental stress, making it ideal for modern residential facades.`
  },
  {
    name: 'Spider Glazing System',
    description: `The spider glazing system employs point-fixed stainless steel spider fittings to secure expansive structural glass panes, ensuring maximum transparency and unobstructed views. Designed for durability, the stainless steel hardware resists corrosion while maintaining structural integrity under heavy loads. This system delivers a premium aesthetic ideal for atriums and commercial shopfronts.`
  },
  {
    name: 'Stick Curtain Wall',
    description: `The stick curtain wall system features aluminium mullions and transoms that provide a crisp, modular framework for large insulated glass panels. Its robust construction ensures long-term weather resistance and thermal efficiency, while the powder-coated finish enhances durability. This system offers flexibility in installation and maintenance for multi-storey facades.`
  },
  {
    name: 'Structural Glazing Curtain Wall',
    description: `The structural glazing curtain wall uses hidden silicone bonding to create a seamless, uninterrupted glass exterior. Engineered for high wind-load resistance and thermal performance, the system eliminates visible framing for a sleek, reflective finish. This premium design enhances both energy efficiency and architectural prestige for modern office towers.`
  },
  {
    name: 'French Door — Double',
    description: `Crafted from powder-coated aluminium, these double French doors combine full-height tempered safety glass with a modern multipoint locking system. The corrosion-resistant finish ensures longevity, while the slimline frames maximise natural light and visibility. This premium design balances elegance with security for luxury residential applications.`
  },
  {
    name: 'Hinged Single Door',
    description: `This single-leaf hinged door is finished in premium anodised aluminium, offering both durability and a refined aesthetic. The elongated vertical pull handle provides ergonomic functionality, while concealed hinges maintain a minimalist appearance. Engineered for strength and corrosion resistance, it is a statement piece for high-end entrances.`
  },
  {
    name: 'Sliding Door — 2 Panel',
    description: `This two-panel sliding door system features ultra-slim aluminium profiles and tempered glass panels engineered for smooth, silent operation. The heavy-duty rollers and recessed floor track ensure effortless movement and long-term durability. Designed for residential spaces, it provides panoramic views and seamless indoor-outdoor transitions.`
  },
  {
    name: 'Sliding Door — 3 Panel',
    description: `The three-panel sliding door system utilises a precision triple-track mechanism allowing two panels to stack neatly behind the third for maximum ventilation. Constructed from high-strength aluminium and laminated safety glass, it offers superior weather resistance and structural stability with a minimalist design.`
  },
  {
    name: 'Glass Partition — Frameless',
    description: `This frameless glass partition system employs single-glazed toughened glass with architectural patch fittings for a clean, uninterrupted aesthetic. The precision-engineered swing door integrates seamlessly, maintaining acoustic separation while maximising transparency. Ideal for corporate interiors requiring privacy and light flow.`
  },
  {
    name: 'Office Partition — Single Glazed',
    description: `Constructed with slimline aluminium framing and single-pane toughened glass, this partition system offers a clean, functional divide for open-plan offices. Its lightweight design allows for quick installation and easy reconfiguration as space needs change. Ideal for meeting rooms and workstations requiring visual connectivity.`
  },
  {
    name: 'Office Partition — Double Glazed',
    description: `Featuring twin panes of toughened glass separated by an insulating air gap, this partition delivers enhanced sound insulation for busy office environments. The dual-glazed aluminium frame maintains a slim profile while significantly reducing noise transfer between spaces. Perfect for boardrooms and private offices.`
  },
  {
    name: 'Fixed Window — Single Pane',
    description: `A non-opening window system built with a single pane of toughened glass set within a slim aluminium frame, designed to maximise natural light and unobstructed views. Its fixed design offers excellent weather sealing and minimal maintenance. Ideal for feature windows, stairwells, and areas where ventilation isn't required.`
  },
  {
    name: 'Sliding Window — 2 Panel',
    description: `This two-panel sliding window combines smooth horizontal operation with a durable aluminium track system for reliable, low-maintenance ventilation. Toughened glass panels provide safety and clarity, while the slim frame maximises glazed area. Well suited to residential and commercial spaces needing space-saving ventilation control.`
  },
  {
    name: 'Casement Window — Side Hung',
    description: `Hinged along one side and opening outward via a friction stay, this casement window offers full ventilation control and a tight weather seal when closed. The aluminium frame is finished for long-term corrosion resistance in varied climates. A versatile choice for kitchens, bathrooms, and living spaces alike.`
  },
  {
    name: 'Top Hung Window',
    description: `Hinged at the top and opening outward from the bottom, this window style allows ventilation even during light rain thanks to its natural weather-shedding angle. Built with a corrosion-resistant aluminium frame and toughened glass, it's a practical option for bathrooms and rooms requiring discreet, controlled airflow.`
  },
  {
    name: 'Premium Stainless Steel Handrails',
    description: `Crafted from Grade 316 brushed stainless steel, these handrails and guardrails are precision-welded for seamless joints and maximum durability. The corrosion-resistant finish ensures longevity in high-traffic environments while maintaining a sleek, minimalist aesthetic. Perfectly aligned geometric lines enhance the modern luxury appeal.`
  },
  {
    name: 'Frameless Glass Sunroof & Pergola Systems',
    description: `Built with a heavy-duty structural steel frame, this pergola system supports laminated overhead safety glass panels designed for strength and impact resistance. The frameless design maximises transparency and natural light, while the steel frame guarantees structural stability for luxury outdoor patios.`
  },
  {
    name: 'Acoustic Gypsum Ceilings with Integrated Lighting',
    description: `Multi-layered gypsum boards provide superior acoustic performance while maintaining a flawless, seamless finish. Integrated LED strip lighting is concealed within crisp shadow lines, delivering warm ambient illumination without visible fixtures. This ceiling system balances functionality with refined modern design.`
  },
  {
    name: 'Commercial Structural Gypsum Partitioning',
    description: `Engineered with high-strength gypsum boards, these partitions deliver smooth, perfectly straight surfaces with crisp corner detailing. The system offers excellent fire resistance and acoustic separation, making it ideal for modern commercial and residential interiors with a clean, minimalist finish.`
  },
  {
    name: 'Modern Fitted Kitchen & Wardrobe Cabinets',
    description: `Custom-built cabinetry features handleless matte-finish panels for a sleek, contemporary aesthetic. Constructed with premium carpentry techniques, the kitchen and wardrobe systems ensure durability and precision alignment. Floor-to-ceiling designs maximise storage while maintaining a minimalist luxury appeal.`
  },
  {
    name: 'High-Traffic Precision Porcelain Floor Tiling',
    description: `Large-format 60x120 cm polished porcelain tiles are laid with ultra-thin, colour-matched grout lines for a flawless finish. Engineered for high-traffic durability, the tiles resist wear, stains, and moisture while maintaining a refined, premium look and reflective surface.`
  }
];

async function updateProducts() {
  try {
    console.log(`Updating ${updates.length} product descriptions...`);
    
    for (const update of updates) {
      const result = await knex('products')
        .where('name', update.name)
        .update({ description: update.description });
      
      if (result > 0) {
        console.log(`✓ Updated: ${update.name}`);
      } else {
        console.log(`✗ Not found: ${update.name}`);
      }
    }
    
    console.log('\n✅ All updates completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating products:', error.message);
    process.exit(1);
  }
}

updateProducts();