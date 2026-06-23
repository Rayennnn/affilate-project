export type Product = {
  id: string;
  name: string;
  brand: string;
  brandLogo: string;
  brandLogoBg: string;
  image: string;
  price: string;
  commission: number;
  hot?: boolean;
};

export const products: Product[] = [
  {
    id: "1",
    name: "Nova-X Studio Headphones",
    brand: "Aura Audio",
    brandLogo:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9wrZgphVxCpLWfWmxDlznvLps2MqlImGTuGkbJrH1M2GoP060Q6XFo60fnMxQ15z0x-JuxsqkMC_DfBohg3svkWXMKrSDw8SJ8Bqj5WOckOUFfM7vxhehe3lwQ9ISNdBVsc-Qf_jzlVL_1zoUzscCWF6ZG6EUUM3uamhJifdgM63HY0B899n52SXoWKqBhNL9cPxDI5rCSOR0G8ji-tWqUMKF9kGFXqQgDOAzItE2BsWkTUtKYDI0RejGFnL02eyJC0qpXG3DuJ-k",
    brandLogoBg: "bg-white",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkiBTyt67XvIn06frVUpx8Ii8NK2V7q6KXuGAEgUGfpYIMAKWhVhAF7zKIy_EkceoSwF6BtRUpkvSgiY4bLLWeb85NoosLuvT2x7pIjRNcVoSt-u89XUZph-TAX9p-6wjOJ0xmdBQBNZpIjVnyg9MIySaTOnsRdbg7XdvKxnPheJRQhF__Vi7edBUkcF4rfNqc4YptHgFayNj0zePoeKVB6BLWOkOyR6HAUoEui_6xbwK8BXFRft4c7Y-PuplRm1_6tTS8nKeOG1a7",
    price: "$349.00",
    commission: 25,
    hot: true,
  },
  {
    id: "2",
    name: "Tactile Pro Creator Deck",
    brand: "CorePeripherals",
    brandLogo:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCIMBG6GaJnKbcYEOBfyMHl0SnkogjShbP7ZDUIL_dAIZYm4vd_9J9RhRVnucreK50P-amRQxI6Vg0z7HdltQWaYnyeESD0Fld0qvVyTw1TYDwQJXCLIliRTeRz2LC1cA3ny2OFb2ZEkwmtfV5m4lxfD-fdWG4t9XYX5zpJd9NgcSOj0icWMBRQp_KK8WFGktDwEIIJm4GeIkE0kATlK0MAsj1tzfUo4fCznfkvyFIBu8RbSHhMLgsu-1KFR1cYYo6N5yVoh1zBnspl",
    brandLogoBg: "bg-[#353535]",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAuyqhgN0ZiJRzCa49JqXgGwub5M7x7lyifT98RFdChq6ZBCPjH9nZ-d3dPv1T-9pa1vY1fH2BOTXkXuptFdSjdvlwwR5SsyK9fGG33K6XbFoUYk7PGku3lX2o80wf3WbrKPLEmrFgPcgOD4kLNw2Ze4npIuowwQRHXK57n1937Nft0LulkVoLZjE1J5cz6SbXxb4B3mzIB5KB-bD0qzT6ifpgOuBnI8l7oMufe84lU6QO4RMdctpMC8wcmgJz85UZdwO9GTL5pvluw",
    price: "$189.99",
    commission: 18,
  },
  {
    id: "3",
    name: "Streamer Elite Mic Bundle",
    brand: "VoiceStream",
    brandLogo:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPUtUGu-0iXDI0KBtFx86hz77cdmedqh6MhsWq7pQop63kCUWJtRZUn80FmqoB0UBkLlrtwLtqkIum9fd0tzf6Jc3iR3lFKUD_1usarVdat869jyMo3kb0CIRjf9S3-FujXWC6iZUszJYpK40u2FFOmDWZwKZgdRfDbGmaqeg5m7wML0Yj4jqsGaz3brRyV55PwIRJU6WtO3xAYkCRaXbdSjSIXfhUxUAx37UvW8K2WRz4mCNZ9f8pxGlokHYvia0fnCKPqc_e-k9z",
    brandLogoBg: "bg-white",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmlWShCHY9uqo9jXDgfGGdc1a8SAvIaUACZdORKct0KpAk9QupL9WjJ-5R5WbRBgOpvNS_7jEe4WN6j28cWYXOm8lkyvHNL57smc5TKskQK9domSxpoqpSq0oVpTuKXkgUaP17rN_X8WLD93ByWQRfg_nCAeE_nWkbs6IoQlVWPj-8msXHW2E3ZN_-_U6URvorjl7GY7QXD3v_ibKZNuQFJld4FIh0ZN0vGLIwiHwLiPK3iPbLNhAmIwuHFClTjYrdZtoAzKxdMYWf",
    price: "$299.00",
    commission: 22,
    hot: true,
  },
  {
    id: "4",
    name: "Z-Series 4K Cinema Camera",
    brand: "OpticPro",
    brandLogo:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA819E9inqeeaeUL4MGT92zCbn035fC6-x1z08OOkde-PSsjrFkWcA_g5DHFCKSZYUb-aGjK9qirOJOaW-42PttJOxKH_E0vguSEHGM3pJ6C4PCNEYX6GNWQueDN6KE5jBvZJH1AymQcPOIpjZR6pj-N6JUc0A6lOye6ZFEjHbdBixh4uHkl6-GqVQ8AOv4jDptR3_cplwIFBjzjthRCKNdc2dL_mjxGH3AXd_tNm4scU0vty4H6Wp2tW78JLDCB-1Vb-6Iat04ktLl",
    brandLogoBg: "bg-[#202020]",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCz8oWQJgv-FviJyLldp6fn7uifheT_U4fx-2ccsgr86r_npMPCmALxqcIQ1csOsW93qQNROPEApDXcqNitwJMiKZqwavp_OWX28BBvfY2K9we0MxvMrTK05ZEXNByyykAIBmUA9YCLpSGj4B4uZ6bwAEq5RjEdWs5TC2KgTf5Qaxz12Xxyqk-Ge2_GqzqxJacWPce8Bq9NaU7fncCg0kSJe7Jg1eZIvkOwzh1idtihhyqEmMcRJQSoODDxfdjjr7UwLsryj8X7srW_",
    price: "$2,450.00",
    commission: 12,
  },
  {
    id: "5",
    name: "AuraFlow RGB Smart Panels",
    brand: "LumiaSet",
    brandLogo:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDbbT_1GuMcsnb5t5RB3-d_xVHq5JSfrMNjq2O0TOZpN0ddnawX1qoabGfDKUphH_Ay-dr7zDgFeSHqwgAsEBXWHGifwVC3OOfhmO7jvWbeY5VYlN6gWcYMr2HlFaVn1CgCBhjv03_D8W2mV-8JPs3YZpeSRk0yc0Ary9ZZjo1HBKnAKFiMuwydj2cxp3jseoF5650jKyrSL3irCHutIuke235u-g0liKtOfFmRe3booHAukDOGgqdlRfizFReC7DPhzeO__L5Dzj2B",
    brandLogoBg: "bg-white",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAb9R0oRaP-lVMvokYtSoxOqv-p7vowYzJr8Grl0El0GPIGv7GTpSJA4Z3XA8tl1XU3dfG9VjKr_SCbWh8ZrJ1ulFaoTbHGxCsawVq5rJT6crj5OPUZ6iZ0ityctJv8X0VU8VJdSw9NLHwTeET4BjHG7pQwUr7AmthZk6qOumFg0ZhCBWZdYvA6upQy5Q7NaBHxpdEpufNl-9aoVS3-BiNHdf0FiQJxwajOZqJRFQ5q12X9X_VzsRxKabwX9KbCDl2l_8h7bEwgoi08",
    price: "$129.50",
    commission: 30,
  },
  {
    id: "6",
    name: "Apex Runner Gen-3 Sneakers",
    brand: "VeloFootwear",
    brandLogo:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZtWgwApQwR_6mo6y0venX9SBYF766C5F4N-0CV5CcIcpNMyG5ytRD9bV130s5Uy9GTmgBxkEcDSMz_eAhvQmvWBxKzC-Hx3vv7yrOQBGHVAsGMw0-rQT3qYqFPo4UdOsOkJKlZO3rZezQLRm8iMNKxWqeybWCG0Z0p-koxkEnAhV19Wg9hNR2mhOc5b5KMOCUDYZBonNttxnTleAlI9N3PBeeSv4TtshOvnoXGTNTj3ZJ9HYwxjPeE_XzK3c8hHHc04WCA-dLO2st",
    brandLogoBg: "bg-black",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0UDFLkdThDOX0taxmddeVNXoB-9lmw9mJnI2d9iMFQ4Yqf-uHwkFWTj2KmvIU2cDZQI-UfPGXXlQsUL5g_6fcDh9OaS20aphtOSCY2WFeJx1t7lbXiCUG91lsDCV1CIolZJw06sp4sUUp3u6G5hMhaeEV3sTwrRJ6rRHBlhyisjgkznYqRMRGJyeIB6QsLyjQFzCcw89-1DAYeevShOkRpC3AgFD7DAV8a5Hyp0tlwib_qMrj2SRoPITebEwcXcl50p-unnJ5Z_Bk",
    price: "$160.00",
    commission: 20,
    hot: true,
  },
];

export const CREATOR_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCsqXJUso8AUPq56GgkuS0Z9T73KRe7NRsirThJ8SPWCp1Z0AJ0UNpuKWpe_4cmAKfYCGwVy9fZ2kR0-N05XhYbm3fXk2ezKtobI-ec6vt7PwR4jT2U-Eu9Akkjx-NEiE7d3zZpUDjASV2ir_y5jWKkl07XV66qw79QxbdJH1iC99w_s59hHLlsb63yFvjAqc47lvdRSlJn6H7tQl3R1I1jU45AQMM0Kengw0YdhKV1AUq8xUaeG4CzajGdhnW7WZHROvWausO9LK8q";
